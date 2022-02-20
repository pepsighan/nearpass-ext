import create from 'zustand';
import { zustandStorage } from '../extensionStorage';
import { persist } from 'zustand/middleware';

type UseTempSitePasswordStore = {
  website: string | null;
  username: string | null;
  password: string | null;
  setTempSitePassword(
    website: string,
    username: string,
    password: string
  ): void;
  forgetPassword(): void;
};

/**
 * Store for temporary site passwords that were detected when the user
 * tried logging in and signing up.
 *
 * So, that we can ask them to save it.
 */
export const useTempSitePassword = create<UseTempSitePasswordStore>(
  persist(
    (set, get) => ({
      website: null,
      username: null,
      password: null,
      setTempSitePassword: (website, username, password) =>
        set({
          website,
          username,
          password,
        }),
      forgetPassword: () =>
        set({
          website: null,
          username: null,
          password: null,
        }),
    }),
    { name: 'temp-site-password', getStorage: () => zustandStorage }
  )
);
