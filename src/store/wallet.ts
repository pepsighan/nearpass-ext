import create from 'zustand';
import { useCallback, useEffect } from 'react';
import { connect, Contract, WalletConnection } from 'near-api-js';
import networkConfig from '../config/networkConfig';
import config from '../config/config';
import { useForgetAccount } from './account';
import { ExtensionKeyStore } from '../extensionStorage';

type NearpassContract = {
  get_account_signature(arg: { account_id: string }): Promise<string>;
  initialize_account_signature(arg: { signature: string }): Promise<void>;
  add_site_password(arg: { enc_pass: string }): Promise<string>;
  get_all_site_password_ids(arg: {
    account_id: string;
  }): Promise<number[] | null>;
  get_site_passwords_by_ids(arg: {
    account_id: string;
    pass_ids: number[];
  }): Promise<string[]>;
  delete_site_password(arg: { pass_id: string }): Promise<void>;
  add_text(arg: { enc_text: string }): Promise<string>;
  get_all_text_ids(arg: { account_id: string }): Promise<number[] | null>;
  get_texts_by_ids(arg: {
    account_id: string;
    text_ids: number[];
  }): Promise<string[]>;
  delete_text(arg: { text_id: string }): Promise<void>;
};

type UseWalletInnerStore = {
  wallet: WalletConnection | null;
  contract: (NearpassContract & Contract) | null;
  accountId: string | null;
};

/**
 * Store for the wallet and contract object.
 */
const useWalletInner = create<UseWalletInnerStore>(() => ({
  wallet: null,
  contract: null,
  accountId: null,
}));

/**
 * Gets the wallet for an account.
 */
export function useWallet() {
  return useWalletInner(useCallback((state) => state.wallet, []));
}

/**
 * Gets the currently logged in account.
 */
export function useAccountId() {
  return useWalletInner(useCallback((state) => state.accountId, []));
}

/**
 * Gets the initialized contract. This is the place where each interaction with
 * the smart contract is made.
 */
export function useContract() {
  return useWalletInner(useCallback((state) => state.contract, []));
}

/**
 * Initialize the wallet and smart contract for the app during startup.
 */
export function useInitializeWallet() {
  useEffect(() => {
    (async () => {
      const netConf = networkConfig();

      const near = await connect({
        ...netConf,
        keyStore: new ExtensionKeyStore(),
      });

      const wallet = await WalletConnection.createWithChromeStorage(
        near,
        'nearpass'
      );
      // Get the current logged in account id. If not authorized it is empty.
      const accountId = wallet.getAccountId();
      // Create an instance of the contract.
      const contract = new Contract(wallet.account(), config.CONTRACT_NAME, {
        viewMethods: [
          'get_account_signature',
          'get_site_password',
          'get_all_site_password_ids',
          'get_site_passwords_by_ids',
          'get_text',
          'get_all_text_ids',
          'get_texts_by_ids',
        ],
        changeMethods: [
          'initialize_account_signature',
          'add_site_password',
          'update_site_password',
          'delete_site_password',
          'add_text',
          'update_text',
          'delete_text',
        ],
      });

      useWalletInner.setState({
        wallet,
        accountId,
        contract: contract as (NearpassContract & Contract) | null,
      });
    })();
  }, []);
}

/**
 * Logs in with the wallet.
 */
export function useLogin() {
  const wallet = useWallet();

  return useCallback(async () => {
    if (!wallet) {
      throw new Error('Wallet is not initialized yet');
    }

    await wallet.requestSignIn(config.CONTRACT_NAME);
  }, [wallet]);
}

/**
 * Logouts the current wallet account.
 */
export function useLogout() {
  const wallet = useWallet();
  const forgetMasterPassword = useForgetAccount();

  return useCallback(async () => {
    if (!wallet) {
      throw new Error('Wallet is not initialized yet');
    }

    await wallet.signOut();
    forgetMasterPassword();
    useWalletInner.setState({ accountId: null });
    await chrome.storage.local.clear();
  }, [wallet]);
}
