import create from 'zustand';
import { useCallback } from 'react';
import { HmacSHA512 } from 'crypto-js';
import { useAccountId, useContract, useWallet } from './wallet';
import networkConfig from '../config/networkConfig';

type UseAdminPasswordInnerStore = {
  password: string | null;
};

/**
 * Stores the admin password for the account which is used to authenticate
 * the user when they open the app and is also used to encrypt their passwords.
 */
const useAdminPasswordInner = create<UseAdminPasswordInnerStore>(() => ({
  password: null,
}));

/**
 * Stores admin password.
 */
export function storeAdminPassword(password: string) {
  useAdminPasswordInner.setState({ password });
}

/**
 * Verifies whether the given password is correct.
 */
export function verifyAdminPassword(password: string): boolean {
  return useAdminPasswordInner.getState().password === password;
}

/**
 * Securely store the master password such that it can be used in the process
 * of encrypting the passwords in the manager.
 */
export function useSecurelyStoreMasterPassword() {
  const accountId = useAccountId();
  const wallet = useWallet();
  const contract = useContract();

  return useCallback(
    async (password: string) => {
      if (!wallet || !contract) {
        throw new Error('Wallet not initialized yet');
      }

      // If this throws with an error, the hash is already stored.
      await contract.get_account_hash();

      const netConf = networkConfig();
      // Sign the combination of accountId + password with the wallet.
      const signature = await wallet
        .account()
        .connection.signer.signMessage(
          new TextEncoder().encode(accountId + password),
          accountId!,
          netConf.networkId
        );

      // Hash the signature with the password.
      const hash = HmacSHA512(
        new TextDecoder().decode(signature.signature),
        password
      ).toString();

      // Store the hash.
      await contract.initialize_account_hash({ hash });
      // TODO: Remember the password in-memory, somehow.
    },
    [wallet, accountId, contract]
  );
}

/**
 * Verify whether the given master password is correct.
 */
export function useVerifyMasterPassword() {
  const accountId = useAccountId();
  const wallet = useWallet();
  const contract = useContract();

  return useCallback(
    async (password: string) => {
      if (!wallet || !contract) {
        throw new Error('Wallet not initialized yet');
      }

      // If the hash is not stored yet, it will throw error.
      const storedHash = await contract.get_account_hash();

      const netConf = networkConfig();
      // Sign the combination of accountId + password with the wallet.
      const signature = await wallet
        .account()
        .connection.signer.signMessage(
          new TextEncoder().encode(accountId + password),
          accountId!,
          netConf.networkId
        );

      // Hash the signature with the password.
      const hash = HmacSHA512(
        new TextDecoder().decode(signature.signature),
        password
      ).toString();

      // TODO: Remember the password for later use.
      return hash === storedHash;
    },
    [accountId, wallet, contract]
  );
}

/**
 * Get the key which is used to encrypt the data stored on the chain.
 */
export function useGetEncryptionKey() {
  const accountId = useAccountId();
  const wallet = useWallet();
  const verifyMasterPassword = useVerifyMasterPassword();

  return useCallback(async () => {
    if (!wallet) {
      throw new Error('Wallet not initialized yet');
    }

    // TODO: Get the password from store.
    const password = '';

    const isValid = await verifyMasterPassword(password);
    if (!isValid) {
      throw new Error('Invalid password');
    }

    const netConf = networkConfig();

    // Sign the combination of accountId + password with the wallet.
    const key = await wallet
      .account()
      .connection.signer.signMessage(
        new TextEncoder().encode(accountId + password),
        accountId!,
        netConf.networkId
      );

    return key.signature;
  }, [accountId, wallet, verifyMasterPassword]);
}
