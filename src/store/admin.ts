import create from 'zustand';
import { useCallback } from 'react';
import { HmacSHA512 } from 'crypto-js';
import { useAccountId, useWallet } from './wallet';
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
function useSecurelyStoreMasterPassword() {
  const accountId = useAccountId();
  const wallet = useWallet();

  return useCallback(
    async (password: string) => {
      if (!wallet) {
        throw new Error('Wallet not initialized yet');
      }

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
      );

      // TODO: Store the hash in the chain.
    },
    [wallet, accountId]
  );
}
