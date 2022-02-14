import create from 'zustand';
import { useCallback } from 'react';
import { AES, HmacSHA512 } from 'crypto-js';
import { useAccountId, useContract, useWallet } from './wallet';

type UseAdminPasswordInnerStore = {
  encPassword: string | null;
};

/**
 * Stores the admin password for the account which is used to authenticate
 * the user when they open the app and is also used to encrypt their passwords.
 */
const useAdminPasswordInner = create<UseAdminPasswordInnerStore>(() => ({
  encPassword: null,
}));

// Do not change the value, because this is used in signing and encryption.
const appName = 'nearpass';

/**
 * Sets admin password.
 */
export function useSetAdminPassword() {
  const wallet = useWallet();

  return useCallback(
    async (password: string) => {
      if (!wallet) {
        throw new Error('Wallet is not initialized.');
      }

      // Signature is going to be same for an account for a login session.
      // It will change between accounts and login sessions.
      const signed = await wallet
        .account()
        .connection.signer.signMessage(new TextEncoder().encode(appName));

      const encPassword = AES.encrypt(
        password,
        new TextDecoder().decode(signed.signature)
      ).toString();

      useAdminPasswordInner.setState({ encPassword });
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
export async function hashAccountPasswordCombination(
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

  return useCallback(
    async (password: string) => {
      if (!contract) {
        throw new Error('Wallet not initialized yet');
      }

      // If this throws with an error, the hash is already stored.
      await contract.get_account_hash();
      const hash = await hashAccountPasswordCombination(accountId!, password);
      // Store the hash.
      await contract.initialize_account_hash({ hash });
      // TODO: Remember the password in-memory, somehow.
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

  return useCallback(
    async (password: string) => {
      if (!contract) {
        throw new Error('Wallet not initialized yet');
      }

      // If the hash is not stored yet, it will throw error.
      const storedHash = await contract.get_account_hash();
      const hash = await hashAccountPasswordCombination(accountId!, password);

      // TODO: Remember the password for later use.
      return hash === storedHash;
    },
    [accountId, contract]
  );
}
