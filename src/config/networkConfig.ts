import config from './config';
import { ConnectConfig } from 'near-api-js';

export default function networkConfig(): ConnectConfig {
  switch (config.NODE_ENV) {
    case 'production':
    case 'mainnet':
      return {
        networkId: 'mainnet',
        nodeUrl: 'https://rpc.mainnet.near.org',
        walletUrl: 'https://wallet.near.org',
        helperUrl: 'https://helper.mainnet.near.org',
        headers: {},
      };
    case 'development':
    case 'testnet':
      return {
        networkId: 'testnet',
        nodeUrl: 'https://rpc.testnet.near.org',
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org',
        headers: {},
      };
    default:
      throw Error(
        `Unconfigured environment '${config.NODE_ENV}'. Can be configured in src/config.js.`
      );
  }
}
