import { StateStorage } from 'zustand/middleware';

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
