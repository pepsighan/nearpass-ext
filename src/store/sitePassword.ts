import { useCallback, useEffect, useMemo } from 'react';
import { useContract } from './wallet';
import { useEncryptionKey } from './account';
import { useQuery, useQueryClient } from 'react-query';
import create from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandStorage } from '../extensionStorage';
import { cipher, util } from 'node-forge';

export type SitePassword = {
  id: number;
  website: string;
  username: string;
  password: string;
};

/**
 * Adds a site password.
 */
export function useAddSitePassword() {
  const encKey = useEncryptionKey();
  const contract = useContract();
  const query = useQueryClient();

  return useCallback(
    async (payload: SitePassword) => {
      if (!contract) {
        throw new Error('Wallet is not initialized yet');
      }

      if (!encKey) {
        throw new Error('Account is not initialized yet');
      }

      const cipherText = cipher.createCipher('AES-CBC', encKey.key);
      cipherText.start({ iv: encKey.iv });
      cipherText.update(util.createBuffer(JSON.stringify(payload)));
      cipherText.finish();
      const encPass = cipherText.output.toHex();

      // Encrypt the payload JSON and store it.
      await contract.add_site_password({ enc_pass: encPass });

      // Refetch the site passwords.
      await query.invalidateQueries('all-site-passwords');
    },
    [query, contract, encKey]
  );
}

type UseAllSitePasswordsInnerStore = {
  encPasswords: { id: number; encPass: string }[];
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
  const storedEncPasses = useAllSitePasswordsInner(
    useCallback((state) => state.encPasswords, [])
  );

  const query = useQuery('all-site-passwords', async () => {
    if (!contract) {
      return null;
    }

    const ids = await contract.get_all_site_password_ids({
      account_id: contract.account.accountId,
    });

    if ((ids ?? []).length === 0) {
      useAllSitePasswordsInner.setState({ encPasswords: [] });
      return [];
    }

    const passwords = await contract.get_site_passwords_by_ids({
      account_id: contract.account.accountId,
      pass_ids: ids!,
    });
    const encPasswords = passwords.map((it, index) => ({
      id: ids![index],
      encPass: it,
    }));

    useAllSitePasswordsInner.setState({ encPasswords });
    return encPasswords;
  });

  // Fetch for the first time the contract becomes available.
  useEffect(() => {
    if ((query.data?.length ?? 0) === 0) {
      query.refetch();
    }
  }, [contract]);

  const encKey = useEncryptionKey();
  const data: SitePassword[] = useMemo(() => {
    if (!encKey) {
      return [];
    }

    // Load the data from cache until it is available from upstream.
    const allPasses =
      query.isLoading || query.isRefetching
        ? storedEncPasses
        : query.data ?? [];

    return allPasses.map(({ id, encPass }) => {
      // Decrypt each of the password objects.
      const cipherText = cipher.createDecipher('AES-CBC', encKey.key);
      cipherText.start({ iv: encKey.iv });
      cipherText.update(util.createBuffer(util.hexToBytes(encPass)));
      cipherText.finish();
      return {
        id,
        ...JSON.parse(cipherText.output.data),
      } as SitePassword;
    });
  }, [query, encKey]);

  return {
    ...query,
    data,
  };
}

/**
 * Deletes a password from the chain.
 */
export function useDeletePassword() {
  const contract = useContract();
  const query = useQueryClient();

  return useCallback(
    async (passId: number) => {
      if (!contract) {
        throw new Error('Wallet is not initialized yet');
      }

      await contract.delete_site_password({ pass_id: passId });

      // Refetch the site passwords.
      await query.invalidateQueries('all-site-passwords');
    },
    [contract]
  );
}
