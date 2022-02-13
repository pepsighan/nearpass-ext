import create from 'zustand';
import { useCallback, useEffect } from 'react';
import { connect, Contract, keyStores, WalletConnection } from 'near-api-js';
import networkConfig from '../config/networkConfig';

/**
 * Store for the wallet and contract object.
 */
const useWalletInner = create(() => ({
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
        deps: { keyStore: new keyStores.BrowserLocalStorageKeyStore() },
      });

      const wallet = new WalletConnection(near, null);
      // Get the current logged in account id. If not authorized it is empty.
      const accountId = wallet.getAccountId();
      // Create an instance of the contract.
      const contract = new Contract(wallet.account(), netConf.contractName, {
        viewMethods: [
          'get_site_password',
          'get_all_site_password_ids',
          'get_site_passwords_by_ids',
        ],
        changeMethods: [
          'add_site_password',
          'update_site_password',
          'delete_site_password',
        ],
      });

      useWalletInner.setState({
        wallet,
        accountId,
        contract,
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
    const netConf = networkConfig();
    await wallet.requestSignIn(netConf.contractName);
  }, [wallet]);
}

/**
 * Logouts the current wallet account.
 */
export function useLogout() {
  const wallet = useWallet();

  return useCallback(() => {
    wallet.signOut();
    useWalletInner.setState({ accountId: null });
  }, [wallet]);
}
