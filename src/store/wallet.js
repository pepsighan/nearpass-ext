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
 * Get the initialized contract. This is the place where each interaction with
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
        viewMethods: [''],
        changeMethods: [''],
      });

      useWalletInner.setState({
        wallet,
        accountId,
        contract,
      });
    })();
  }, []);
}
