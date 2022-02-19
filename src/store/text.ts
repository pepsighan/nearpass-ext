import { useCallback, useEffect, useMemo } from 'react';
import { useContract } from './wallet';
import { useEncryptionKey } from './account';
import { useQuery, useQueryClient } from 'react-query';
import create from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandStorage } from '../extensionStorage';
import { cipher, util } from 'node-forge';

export type Text = {
  title: string;
  content: string;
};

/**
 * Adds a text.
 */
export function useAddText() {
  const encKey = useEncryptionKey();
  const contract = useContract();
  const query = useQueryClient();

  return useCallback(
    async (payload: Text) => {
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
      const encText = cipherText.output.toHex();

      // Encrypt the payload JSON and store it.
      await contract.add_text({ enc_text: encText });

      // Refetch the site passwords.
      await query.invalidateQueries('all-texts');
    },
    [query, contract, encKey]
  );
}

type UseAllTextsInnerStore = {
  encTexts: string[];
};

/**
 * This is used for caching purposes only.
 */
const useAllTextsInner = create<UseAllTextsInnerStore>(
  persist(
    (set, get) => ({
      encTexts: [],
    }),
    { name: 'site-texts', getStorage: () => zustandStorage }
  )
);

/**
 * Gets all the site passwords of the user.
 */
export function useAllTexts() {
  const contract = useContract();
  const storedEncTexts = useAllTextsInner(
    useCallback((state) => state.encTexts, [])
  );

  const query = useQuery('all-texts', async () => {
    if (!contract) {
      return null;
    }

    const ids = await contract.get_all_text_ids({
      account_id: contract.account.accountId,
    });

    if ((ids ?? []).length === 0) {
      useAllTextsInner.setState({ encTexts: [] });
      return [];
    }

    const encTexts = await contract.get_texts_by_ids({
      account_id: contract.account.accountId,
      text_ids: ids!,
    });

    useAllTextsInner.setState({ encTexts: encTexts });
    return encTexts;
  });

  // Fetch for the first time the contract becomes available.
  useEffect(() => {
    if ((query.data?.length ?? 0) === 0) {
      query.refetch();
    }
  }, [contract]);

  const encKey = useEncryptionKey();
  const data: Text[] = useMemo(() => {
    if (!encKey) {
      return [];
    }

    // Load the data from cache until it is available from upstream.
    const allPasses =
      query.isLoading || query.isRefetching ? storedEncTexts : query.data ?? [];

    return allPasses.map((encText) => {
      // Decrypt each of the text objects.
      const cipherText = cipher.createDecipher('AES-CBC', encKey.key);
      cipherText.start({ iv: encKey.iv });
      cipherText.update(util.createBuffer(util.hexToBytes(encText)));
      cipherText.finish();
      return JSON.parse(cipherText.output.data) as Text;
    });
  }, [query, encKey]);

  return {
    ...query,
    data,
  };
}
