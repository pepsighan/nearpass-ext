import create from 'zustand';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AES, enc } from 'crypto-js';
import { useAccountId, useContract, useWallet } from './wallet';
import { persist } from 'zustand/middleware';
import { WalletConnection } from 'near-api-js';
import { useAsyncFn } from 'react-use';
import { md, pki } from 'node-forge';
import networkConfig from '../config/networkConfig';
import { zustandStorage } from '../extensionStorage';

type UseAccountInner = {
  encPassword: string | null;
  encPrivateKey: string | null;
};

/**
 * Stores the master password and private key for the account which is used to
 * authenticate the user when they open the app and is also used to encrypt
 * their passwords.
 */
const useAccountInner = create<UseAccountInner>(
  persist(
    (set, get) => ({
      encPassword: null,
      encPrivateKey: null,
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
 * Gets the private key for the account.
 */
export function usePrivateKey() {
  const key = useEncryptionKeyForLocalStorage();

  return useAccountInner(
    useCallback(
      (state) => {
        if (!key || !state.encPrivateKey) {
          return null;
        }
        const privateKey = AES.decrypt(state.encPrivateKey, key).toString(
          enc.Utf8
        );
        return pki.privateKeyFromPem(privateKey);
      },
      [key]
    )
  );
}

/**
 * Gets the public key for the account.
 */
export function usePublicKey() {
  const pKey = usePrivateKey();

  return useMemo(
    () => (pKey ? pki.publicKeyFromPem(pki.privateKeyToPem(pKey)) : null),
    [pKey]
  );
}

/**
 * Sets master password.
 */
function useSetMasterPassword() {
  const wallet = useWallet();

  return useCallback(
    async (password: string, privateKey: string) => {
      if (!wallet) {
        throw new Error('Wallet is not initialized.');
      }

      const key = await getEncryptionKeyForLocalStorage(wallet);
      const encPassword = AES.encrypt(password, key).toString();
      const encPrivateKey = AES.encrypt(privateKey, key).toString();

      useAccountInner.setState({ encPassword, encPrivateKey });
    },
    [wallet]
  );
}

/**
 * Sets a new private key after encrypting it.
 */
function useSetPrivateKey() {
  const wallet = useWallet();

  return useCallback(
    async (privateKey: string) => {
      if (!wallet) {
        throw new Error('Wallet is not initialized.');
      }

      const key = await getEncryptionKeyForLocalStorage(wallet);
      const encPrivateKey = AES.encrypt(privateKey, key).toString();
      useAccountInner.setState({ encPrivateKey });
    },
    [wallet]
  );
}

/**
 * Create a signatures for the account which can then be safely stored in the
 * chain. This is to verify if a private key is correct for the account.
 */
async function signAccountId(
  accountId: string,
  privateKey: pki.rsa.PrivateKey
): Promise<string> {
  const hash = md.sha512.create();
  hash.update(accountId, 'utf8');
  return privateKey.sign(hash);
}

/**
 * Initiates the account on the chain and produces a private key.
 */
export function useInitiateAccount() {
  const accountId = useAccountId();
  const contract = useContract();
  const setPrivateKey = useSetPrivateKey();

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

    const keyPair = await generateRSAKeyPair();

    const signature = await signAccountId(accountId!, keyPair.privateKey);
    // Store the hash.
    await contract.initialize_account_signature({ signature });

    // Store the encrypted private key locally.
    const privateKeyPem = pki.privateKeyToPem(keyPair.privateKey);
    await setPrivateKey(privateKeyPem);

    return privateKeyPem;
  }, [accountId, contract, setPrivateKey]);
}

/**
 * Verify whether the given private key is correct.
 */
export function useVerifyAccount() {
  const accountId = useAccountId();
  const contract = useContract();
  const setPrivateKey = useSetPrivateKey();

  return useCallback(
    async (privateKeyPem: string) => {
      if (!contract) {
        throw new Error('Wallet not initialized yet');
      }

      // If the hash is not stored yet, it will throw error.
      const storedHash = await contract.get_account_signature({
        account_id: accountId!,
      });

      const privateKey = pki.privateKeyFromPem(privateKeyPem);
      const hash = await signAccountId(accountId!, privateKey);

      const isCorrect = hash === storedHash;
      if (isCorrect) {
        await setPrivateKey(privateKeyPem);
      }
      return isCorrect;
    },
    [accountId, contract, setPrivateKey]
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
 * Removes the master password and private key from the state and storage.
 * Used during logout.
 */
export function useForgetAccount() {
  return useCallback(() => {
    useAccountInner.setState({ encPassword: null, encPrivateKey: null });
  }, []);
}

/**
 * Generates an RSA Key Pair.
 */
async function generateRSAKeyPair(): Promise<pki.rsa.KeyPair> {
  return new Promise((resolve, reject) => {
    pki.rsa.generateKeyPair({ bits: 2048, workers: 2 }, (err, keyPair) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(keyPair);
    });
  });
}
