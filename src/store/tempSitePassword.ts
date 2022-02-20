import create from 'zustand';

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
export const useTempSitePassword = create<UseTempSitePasswordStore>((set) => ({
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
}));
