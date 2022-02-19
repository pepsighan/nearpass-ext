import create from 'zustand';
import { useCallback, useEffect, useState } from 'react';
import { AES, enc } from 'crypto-js';
import { useAccountId, useContract, useWallet } from './wallet';
import { persist } from 'zustand/middleware';
import { WalletConnection } from 'near-api-js';
import { useAsyncFn } from 'react-use';
import { cipher, random, util } from 'node-forge';
import networkConfig from '../config/networkConfig';
import { zustandStorage } from '../extensionStorage';

type UseAccountInner = {
  encPassword: string | null;
  encEncryptionKey: string | null;
};

/**
 * Stores the master password and encryption key for the account which is used
 * to authenticate the user when they open the app and is also used to encrypt
 * their passwords.
 */
const useAccountInner = create<UseAccountInner>(
  persist(
    (set, get) => ({
      encPassword: null,
      encEncryptionKey: null,
    }),
    { name: 'nearpass-account', getStorage: () => zustandStorage }
  )
);

// Do not change the value, because this is used in signing and encryption.
const appName = 'nearpass';

/**
 * Gets the key which is used to encrypt data before storing in local
 * storage. The key is going to be same for an account for a login session.
 * It will change between accounts and login session.
 *
 * This is different from the account's encryption key which is used to
 * encrypt the data stored on chain.
 */
async function getEncryptionKeyForLocalStorage(wallet: WalletConnection) {
  const netConf = networkConfig();

  const signed = await wallet
    .account()
    .connection.signer.signMessage(
      new TextEncoder().encode(appName),
      wallet.account().accountId,
      netConf.networkId
    );
  return new TextDecoder().decode(signed.signature);
}

/**
 * Gets the encryption key for use with data stored in local storage.
 */
function useEncryptionKeyForLocalStorage() {
  const wallet = useWallet();
  const [key, setKey] = useState<string | null>(null);

  useEffect(() => {
    if (!wallet) {
      return;
    }

    // Get the key on first load as well.
    getEncryptionKeyForLocalStorage(wallet).then(setKey);

    // The key changes if the account changes. And passwords change when
    // accounts change.
    return useAccountInner.subscribe(async () => {
      const key = await getEncryptionKeyForLocalStorage(wallet);
      setKey(key);
    });
  }, [wallet, setKey]);

  return key;
}

/**
 * Gets the master password in plain text.
 */
export function useMasterPassword() {
  const key = useEncryptionKeyForLocalStorage();

  return useAccountInner(
    useCallback(
      (state) => {
        if (!key || !state.encPassword) {
          return null;
        }
        return AES.decrypt(state.encPassword, key).toString(enc.Utf8);
      },
      [key]
    )
  );
}

/**
 * The encryption key for AES to be used for encrypting the data stored
 * on chain.
 */
type EncryptionKey = {
  key: string;
  iv: string;
};

/**
 * Gets the encryption key for the account.
 */
export function useEncryptionKey() {
  const key = useEncryptionKeyForLocalStorage();

  return useAccountInner(
    useCallback(
      (state) => {
        if (!key || !state.encEncryptionKey) {
          return null;
        }

        const encKey = AES.decrypt(state.encEncryptionKey, key).toString(
          enc.Utf8
        );
        return JSON.parse(encKey) as EncryptionKey;
      },
      [key]
    )
  );
}

/**
 * Sets master password.
 */
export function useSetMasterPassword() {
  const wallet = useWallet();

  return useCallback(
    async (password: string) => {
      if (!wallet) {
        throw new Error('Wallet is not initialized.');
      }

      const key = await getEncryptionKeyForLocalStorage(wallet);
      const encPassword = AES.encrypt(password, key).toString();
      useAccountInner.setState({ encPassword });
    },
    [wallet]
  );
}

/**
 * Sets a new encryption key after encrypting it.
 */
function useSetEncryptionKey() {
  const wallet = useWallet();

  return useCallback(
    async (encKey: EncryptionKey) => {
      if (!wallet) {
        throw new Error('Wallet is not initialized.');
      }

      const key = await getEncryptionKeyForLocalStorage(wallet);
      const encEncryptionKey = AES.encrypt(
        JSON.stringify(encKey),
        key
      ).toString();
      useAccountInner.setState({ encEncryptionKey });
    },
    [wallet]
  );
}

/**
 * Create a signatures for the account which can then be safely stored in the
 * chain. This is to verify if an encryption key is correct for the account.
 */
async function signAccountId(
  accountId: string,
  encKey: EncryptionKey
): Promise<string> {
  const cipherText = cipher.createCipher('AES-CBC', encKey.key);
  cipherText.start({ iv: encKey.iv });
  cipherText.update(util.createBuffer(accountId));
  cipherText.finish();
  return cipherText.output.toHex();
}

/**
 * Initiates the account on the chain and produces an encryption key.
 */
export function useInitiateAccount() {
  const accountId = useAccountId();
  const contract = useContract();
  const setEncKey = useSetEncryptionKey();

  return useCallback(async () => {
    if (!contract) {
      throw new Error('Wallet not initialized yet');
    }

    // If hash already exists, it cannot be initialized again.
    let storedHash: string | undefined;
    try {
      storedHash = await contract.get_account_signature({
        account_id: contract.account.accountId,
      });
    } catch (err: any) {
      // Consume error if account hash is not initialized.
      if (!err.toString().includes('NearpassAccountNotInitialized')) {
        throw err;
      }
    }

    if (storedHash) {
      throw new Error('Account is already initialized');
    }

    const encKey = generateKeyandIV();

    const signature = await signAccountId(accountId!, encKey);
    // Store the hash.
    await contract.initialize_account_signature({ signature });

    // Store the encryption key locally.
    await setEncKey(encKey);

    return Buffer.from(JSON.stringify(encKey), 'utf8').toString('base64');
  }, [accountId, contract, setEncKey]);
}

/**
 * Verify whether the given encryption key is correct.
 */
export function useVerifyAccount() {
  const accountId = useAccountId();
  const contract = useContract();
  const setEncKey = useSetEncryptionKey();

  return useCallback(
    async (baseEncKey: string) => {
      if (!contract) {
        throw new Error('Wallet not initialized yet');
      }

      // If the hash is not stored yet, it will throw error.
      const storedHash = await contract.get_account_signature({
        account_id: accountId!,
      });

      const encKey: EncryptionKey = JSON.parse(
        Buffer.from(baseEncKey, 'base64').toString('utf8')
      );
      const hash = await signAccountId(accountId!, encKey);

      const isCorrect = hash === storedHash;
      if (isCorrect) {
        await setEncKey(encKey);
      }
      return isCorrect;
    },
    [accountId, contract, setEncKey]
  );
}

/**
 * Gets the user's account signature which only exists if the user has initiated
 * its account.
 */
export function useGetAccountSignature() {
  const contract = useContract();

  const obj = useAsyncFn(async () => {
    if (!contract) {
      return null;
    }

    try {
      return await contract.get_account_signature({
        account_id: contract.account.accountId,
      });
    } catch (err: any) {
      if (err.toString().includes('NearpassAccountNotInitialized')) {
        // Not initialized yet.
        return null;
      }

      throw err;
    }
  }, [contract]);

  useEffect(() => {
    obj[1]();
    // Only refetch on contract change.
  }, [contract]);

  return obj;
}

/**
 * Removes the master password and encryption key from the state and storage.
 * Used during logout.
 */
export function useForgetAccount() {
  return useCallback(() => {
    useAccountInner.setState({ encPassword: null, encEncryptionKey: null });
  }, []);
}

/**
 * Generates Key and IV for use in AES encryption.
 */
function generateKeyandIV(): EncryptionKey {
  const key = random.getBytesSync(32);
  const iv = random.getBytesSync(16);
  return { key, iv };
}
