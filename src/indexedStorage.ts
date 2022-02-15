import { del, get, set } from 'idb-keyval';
import { StateStorage } from 'zustand/middleware';

/**
 * Encode the name and value for obfuscation though it is not needed.
 */
const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const value = await get(btoa(name));
    if (value) {
      return atob(value);
    }
    return null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(btoa(name), btoa(value));
  },
  removeItem: async (name: string): Promise<void> => {
    await del(btoa(name));
  },
};

export default storage;
