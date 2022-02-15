import { useCallback } from 'react';
import { useContract } from './wallet';
import { useMasterPassword } from './master';
import { AES } from 'crypto-js';

type SitePassword = {
  website: string;
  username: string;
  password: string;
};

/**
 * Adds a site password.
 */
export function useAddSitePassword() {
  const masterPassword = useMasterPassword();
  const contract = useContract();

  return useCallback(
    async (payload: SitePassword) => {
      if (!contract) {
        throw new Error('Wallet is not initialized yet');
      }

      if (!masterPassword) {
        throw new Error('Master password is not initialized yet');
      }

      // Encrypt the payload JSON and store it.
      const encPass = AES.encrypt(
        JSON.stringify(payload),
        masterPassword
      ).toString();
      await contract.add_site_password({ enc_pass: encPass });
    },
    [contract, masterPassword]
  );
}
