import { useCallback, useEffect } from 'react';
import { useContract } from './wallet';
import { useMasterPassword } from './master';
import { AES, enc } from 'crypto-js';
import { useQuery, useQueryClient } from 'react-query';
import create from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandStorage } from '../extensionStorage';

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
  const query = useQueryClient();

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

      // Refetch the site passwords.
      await query.invalidateQueries('all-site-passwords');
    },
    [query, contract, masterPassword]
  );
}

type UseAllSitePasswordsInnerStore = {
  passwords: SitePassword[];
};

/**
 * This is used for caching purposes only.
 */
const useAllSitePasswordsInner = create<UseAllSitePasswordsInnerStore>(
  persist(
    (set, get) => ({
      passwords: [],
    }),
    { name: 'site-passwords', getStorage: () => zustandStorage }
  )
);

/**
 * Gets all the site passwords of the user.
 */
export function useAllSitePasswords() {
  const contract = useContract();
  const masterPassword = useMasterPassword();
  const storedPasswords = useAllSitePasswordsInner(
    useCallback((state) => state.passwords, [])
  );

  const query = useQuery('all-site-passwords', async () => {
    if (!contract || !masterPassword) {
      return null;
    }

    const ids = await contract.get_all_site_password_ids({
      account_id: contract.account.accountId,
    });

    const encPasses = await contract.get_site_passwords_by_ids({
      account_id: contract.account.accountId,
      pass_ids: ids,
    });

    const passwords = encPasses.map((encPass) => {
      const decoded = AES.decrypt(encPass, masterPassword).toString(enc.Utf8);
      return JSON.parse(decoded) as SitePassword;
    });

    useAllSitePasswordsInner.setState({ passwords });
    return passwords;
  });

  // Fetch for the first time the contract and password become available.
  useEffect(() => {
    if ((query.data?.length ?? 0) === 0) {
      query.refetch();
    }
  }, [contract, masterPassword]);

  return {
    ...query,
    // Load the data from cache until it is available from upstream.
    data:
      query.isLoading || query.isRefetching
        ? storedPasswords
        : query.data ?? [],
  };
}
