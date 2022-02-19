import { useCallback, useEffect, useMemo } from 'react';
import { useContract } from './wallet';
import { useMasterPassword, useEncryptionKey, usePublicKey } from './account';
import { useQuery, useQueryClient } from 'react-query';
import create from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandStorage } from '../extensionStorage';

export type SitePassword = {
  website: string;
  username: string;
  password: string;
};

/**
 * Adds a site password.
 */
export function useAddSitePassword() {
  const publicKey = usePublicKey();
  const contract = useContract();
  const query = useQueryClient();

  return useCallback(
    async (payload: SitePassword) => {
      if (!contract) {
        throw new Error('Wallet is not initialized yet');
      }

      if (!publicKey) {
        throw new Error('Account is not initialized yet');
      }

      // Encrypt the payload JSON and store it.
      const encPass = publicKey.encrypt(JSON.stringify(payload));
      await contract.add_site_password({ enc_pass: encPass });

      // Refetch the site passwords.
      await query.invalidateQueries('all-site-passwords');
    },
    [query, contract, publicKey]
  );
}

type UseAllSitePasswordsInnerStore = {
  encPasswords: string[];
};

/**
 * This is used for caching purposes only.
 */
const useAllSitePasswordsInner = create<UseAllSitePasswordsInnerStore>(
  persist(
    (set, get) => ({
      encPasswords: [],
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
  const storedEncPasses = useAllSitePasswordsInner(
    useCallback((state) => state.encPasswords, [])
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

    useAllSitePasswordsInner.setState({ encPasswords: encPasses });
    return encPasses;
  });

  // Fetch for the first time the contract and password become available.
  useEffect(() => {
    if ((query.data?.length ?? 0) === 0) {
      query.refetch();
    }
  }, [contract, masterPassword]);

  const privateKey = useEncryptionKey();
  const data: SitePassword[] = useMemo(() => {
    if (!masterPassword || !privateKey) {
      return [];
    }

    // Load the data from cache until it is available from upstream.
    const allPasses =
      query.isLoading || query.isRefetching
        ? storedEncPasses
        : query.data ?? [];

    return allPasses.map((encPass) => {
      const decoded = privateKey.decrypt(encPass);
      return JSON.parse(decoded) as SitePassword;
    });
  }, [query, storedEncPasses, masterPassword]);

  return {
    ...query,
    data,
  };
}
