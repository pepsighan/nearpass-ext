import React, { useCallback, useEffect } from 'react';
import { useAllSitePasswords } from '../store/sitePassword';
import { useTempSitePassword } from '../store/tempSitePassword';
import { BackgroundMessage } from '../messages';

/**
 * Detection of the login form is done by using a method outlaid in
 * https://stackoverflow.com/a/2403848.
 *
 * A password field is detected first which needs to be wrapped within
 * a form. And within that form, a username/email field is detected.
 */
function detectForm() {
  const password = window.document.querySelector('input[type="password"]');
  if (!password) {
    return;
  }

  const form = password.closest('form');
  if (!form) {
    return;
  }

  const username =
    form.querySelector(`input[name="email"],input[name="username"],
        input[type="email"], input[autocomplete="username"],
        input[autocomplete="email"]`);
  if (!username) {
    return;
  }

  return { form, username, password };
}

export default function PasswordSaveDetection() {
  const { data: existingPasswords } = useAllSitePasswords();
  const setTempSitePassword = useTempSitePassword(
    useCallback((state) => state.setTempSitePassword, [])
  );

  useEffect(() => {
    const f = detectForm();
    if (!f) {
      return;
    }

    const { form, username, password } = f;

    const onSubmit = async () => {
      const website =
        window.location.protocol + '//' + window.location.hostname;
      const usernameText = (username as any).value;
      const passwordText = (password as any).value;

      const found = existingPasswords.some(
        (it) => it.website === website && it.username === usernameText
      );
      if (found) {
        // No need to ask the user to save the same thing again.
        // TODO: If the password has changed, ask the user to save the new
        // password.
        return;
      }

      setTempSitePassword(website, usernameText, passwordText);
      chrome.runtime.sendMessage({
        type: BackgroundMessage.SetPopupBadge,
      });
    };

    form.addEventListener('submit', onSubmit);
    return () => {
      form.removeEventListener('submit', onSubmit);
    };
  }, [existingPasswords]);

  return <></>;
}
