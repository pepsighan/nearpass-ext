import React, { useEffect } from 'react';

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
  useEffect(() => {
    const f = detectForm();
    if (!f) {
      return;
    }

    const { form, username, password } = f;

    const onSubmit = () => {
      // TODO: Trigger the popup for saving the credentials for
      // the site.
      // TODO: Also, check if they are already saved.

      console.log(window.location.protocol + '//' + window.location.hostname);
      console.log((username as any).value);
      console.log((password as any).value);
    };

    form.addEventListener('submit', onSubmit);
    return () => {
      form.removeEventListener('submit', onSubmit);
    };
  }, []);

  return <></>;
}
