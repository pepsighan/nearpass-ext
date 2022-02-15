import { useCallback } from 'react';
import { useContract } from './wallet';
import { useMasterPassword } from './master';
import { AES } from 'crypto-js';
import { useQuery } from 'react-query';

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

/**
 * Gets all the site passwords of the user.
 */
export function useAllSitePasswords() {
  const contract = useContract();
  const masterPassword = useMasterPassword();

  return useQuery('all-site-passwords', async () => {
    if (!contract || !masterPassword) {
      return [];
    }

    const ids = await contract.get_all_site_password_ids({
      account_id: contract.account.accountId,
    });
    const encPasses = await contract.get_site_passwords_by_ids({
      account_id: contract.account.accountId,
      pass_ids: ids,
    });

    return encPasses.map((encPass) => {
      const decoded = AES.decrypt(encPass, masterPassword).toString();
      return JSON.parse(decoded) as SitePassword;
    });
  });
}
