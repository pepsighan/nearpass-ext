import create from 'zustand';
import { useCallback, useEffect, useState } from 'react';
import { AES, enc, HmacSHA512 } from 'crypto-js';
import { useAccountId, useContract, useWallet } from './wallet';
import { persist } from 'zustand/middleware';
import { WalletConnection } from 'near-api-js';
import { useAsyncFn } from 'react-use';
import networkConfig from '../config/networkConfig';
import { zustandStorage } from '../extensionStorage';

type UseMasterPasswordInnerStore = {
  encPassword: string | null;
};

/**
 * Stores the master password for the account which is used to authenticate
 * the user when they open the app and is also used to encrypt their passwords.
 */
const useMasterPasswordInner = create<UseMasterPasswordInnerStore>(
  persist(
    (set, get) => ({
      encPassword: null,
    }),
    { name: 'nearpass-session', getStorage: () => zustandStorage }
  )
);

// Do not change the value, because this is used in signing and encryption.
const appName = 'nearpass';

/**
 * Gets the key which is used to encrypt password before storing in local
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
 * Gets the master password in plain text.
 */
export function useMasterPassword() {
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
    return useMasterPasswordInner.subscribe(async () => {
      const key = await getEncryptionKeyForLocalStorage(wallet);
      setKey(key);
    });
  }, [wallet, setKey]);

  return useMasterPasswordInner(
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
 * Sets master password.
 */
function useSetMasterPassword() {
  const wallet = useWallet();

  return useCallback(
    async (password: string) => {
      if (!wallet) {
        throw new Error('Wallet is not initialized.');
      }

      const key = await getEncryptionKeyForLocalStorage(wallet);
      const encPassword = AES.encrypt(password, key).toString();

      useMasterPasswordInner.setState({ encPassword });
    },
    [wallet]
  );
}

/**
 * Create a hash for the account and password which can then be safely
 * stored in the chain. This hash is to be used to verify whether a password
 * for an account is correct or not. Since, a single master password is used to
 * encrypt all the data for an account stored on chain.
 *
 * Creating a hash assures that no part of the actual password whatsoever is
 * stored on-chain and only its fingerprint is stored (which cannot be used
 * to recover the original).
 */
async function hashAccountPasswordCombination(
  accountId: string,
  password: string
): Promise<string> {
  return HmacSHA512(accountId + password, password).toString();
}

/**
 * Securely store the master password such that it can be used in the process
 * of encrypting the passwords in the manager.
 */
export function useSecurelyStoreMasterPassword() {
  const accountId = useAccountId();
  const contract = useContract();
  const setMasterPassword = useSetMasterPassword();

  return useCallback(
    async (password: string) => {
      if (!contract) {
        throw new Error('Wallet not initialized yet');
      }

      // If hash already exists, it cannot be initialized again.
      let storedHash: string | undefined;
      try {
        storedHash = await contract.get_account_hash({
          account_id: contract.account.accountId,
        });
      } catch (err: any) {
        // Consume error if account hash is not initialized.
        if (!err.toString().includes('NearpassAccountNotInitialized')) {
          throw err;
        }
      }

      if (storedHash) {
        throw new Error('Master password is already initialized');
      }

      const hash = await hashAccountPasswordCombination(accountId!, password);

      // Store the hash.
      await contract.initialize_account_hash({ hash });
      await setMasterPassword(password);
    },
    [accountId, contract]
  );
}

/**
 * Verify whether the given master password is correct.
 */
export function useVerifyMasterPassword() {
  const accountId = useAccountId();
  const contract = useContract();
  const setMasterPassword = useSetMasterPassword();

  return useCallback(
    async (password: string) => {
      if (!contract) {
        throw new Error('Wallet not initialized yet');
      }

      // If the hash is not stored yet, it will throw error.
      const storedHash = await contract.get_account_hash({
        account_id: accountId!,
      });
      const hash = await hashAccountPasswordCombination(accountId!, password);

      const isCorrect = hash === storedHash;
      if (isCorrect) {
        await setMasterPassword(password);
      }
      return isCorrect;
    },
    [accountId, contract]
  );
}

/**
 * Gets the user's account hash which only exists if the user has set a
 * master password.
 */
export function useGetAccountHash() {
  const contract = useContract();

  const obj = useAsyncFn(async () => {
    if (!contract) {
      return null;
    }

    try {
      return await contract.get_account_hash({
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
 * Removes the master password from the state and storage. Used during
 * logout.
 */
export function useForgetMasterPassword() {
  return useCallback(() => {
    useMasterPasswordInner.setState({ encPassword: null });
  }, []);
}
