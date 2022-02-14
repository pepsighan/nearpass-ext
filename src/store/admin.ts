import create from 'zustand';

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
