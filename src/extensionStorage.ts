import { StateStorage } from 'zustand/middleware';
import { KeyPair, keyStores } from 'near-api-js';

/**
 * Concrete implementation to store the zustand state locally within
 * the extension.
 */
export const zustandStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const value = await chrome.storage.local.get(name);
    return value[name] ?? null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await chrome.storage.local.set({ [name]: value });
  },
  removeItem: async (name: string): Promise<void> => {
    await chrome.storage.local.get(name);
  },
};

/**
 * Implements the keystore using extension's storage. Adapted from the
 * code at https://github.com/near/near-api-js/blob/master/lib/key_stores/browser_local_storage_key_store.js.
 */
export class ExtensionKeyStore extends keyStores.KeyStore {
  private prefix: string = 'near-api-js:keystore:';

  /**
   * Clears all the keys stored by this KeyStore.
   */
  async clear(): Promise<void> {
    const all = await chrome.storage.local.get();
    await Promise.all(
      Object.keys(all)
        .filter((key) => key.startsWith(this.prefix))
        .map((key) => chrome.storage.local.remove(key))
    );
  }

  /**
   * Gets all the accounts from the chrome storage.
   */
  async getAccounts(networkId: string): Promise<string[]> {
    const all = await chrome.storage.local.get();

    return Object.keys(all)
      .filter((key) => key.startsWith(this.prefix))
      .map((key) => key.substring(this.prefix.length).split(':'))
      .filter((parts) => parts[1] === networkId)
      .map((parts) => parts[0]);
  }

  /**
   * Gets the KeyPair from chrome storage.
   */
  async getKey(networkId: string, accountId: string): Promise<KeyPair> {
    const key = this.keyForValue(networkId, accountId);
    const value = await chrome.storage.local.get(key);
    if (!value[key]) {
      // The typings are wrong for this.
      return null as unknown as KeyPair;
    }
    return KeyPair.fromString(value[key]);
  }

  /**
   * Gets all the networks from chrome storage.
   */
  async getNetworks(): Promise<string[]> {
    const result = new Set<string>();

    const all = await chrome.storage.local.get();
    Object.keys(all)
      .filter((key) => key.startsWith(this.prefix))
      .map((key) => key.substring(this.prefix.length).split(':'))
      .forEach((splits) => {
        result.add(splits[1]);
      });

    return Array.from(result.values());
  }

  /**
   * Removes the key from chrome storage.
   */
  async removeKey(networkId: string, accountId: string): Promise<void> {
    const key = this.keyForValue(networkId, accountId);
    await chrome.storage.local.remove(key);
  }

  /**
   * Stores the KeyPair in chrome storage.
   */
  async setKey(
    networkId: string,
    accountId: string,
    keyPair: KeyPair
  ): Promise<void> {
    const key = this.keyForValue(networkId, accountId);
    await chrome.storage.local.set({ [key]: keyPair.toString() });
  }

  /**
   * Generates a key for a value.
   */
  keyForValue(networkId: string, accountId: string) {
    return `${this.prefix}${accountId}:${networkId}`;
  }
}
