import { Stack, TextField, Typography } from '@mui/material';
import React, { FormEvent, useCallback, useState } from 'react';
import { useAsyncFn } from 'react-use';
import { LoadingButton } from '@mui/lab';
import { useTempSitePassword } from '../store/tempSitePassword';
import { useAddSitePassword } from '../store/sitePassword';
import { BackgroundMessage } from '../messages';

export default function PopupSaveForm() {
  const [saved, setSaved] = useState(false);
  const { website, username, password, forgetPassword } = useTempSitePassword();

  const addSitePassword = useAddSitePassword();
  const [{ loading }, onSave] = useAsyncFn(
    async (ev: FormEvent) => {
      ev.preventDefault();

      if (!website || !username || !password) {
        return;
      }

      await addSitePassword({ website, username, password });

      // Forget the password from store and remove the badge from the extension
      // icon.
      await forgetPassword();
      setSaved(true);
      chrome.runtime.sendMessage({
        type: BackgroundMessage.RemovePopupBadge,
      });
    },
    [addSitePassword, website, username, password, forgetPassword, setSaved]
  );

  const onDiscard = useCallback(() => {
    forgetPassword();
    chrome.runtime.sendMessage({
      type: BackgroundMessage.RemovePopupBadge,
    });
  }, [forgetPassword]);

  return (
    <>
      {!saved && website && (
        <>
          <Typography variant="body2" textAlign="center" color="textSecondary">
            You just logged in with the following credentials. Save them on
            Nearpass?
          </Typography>

          <Stack component="form" spacing={2} sx={{ mt: 3 }} onSubmit={onSave}>
            <TextField label="Website" value={website} size="small" disabled />
            <TextField
              label="Username"
              value={username}
              size="small"
              disabled
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              size="small"
              disabled
            />
            <Stack direction="row" spacing={2}>
              <LoadingButton
                variant="outlined"
                color="error"
                fullWidth
                disabled={loading}
                onClick={onDiscard}
              >
                Discard Password
              </LoadingButton>

              <LoadingButton
                variant="contained"
                type="submit"
                fullWidth
                loading={loading}
              >
                Save Password
              </LoadingButton>
            </Stack>
          </Stack>
        </>
      )}

      {saved && (
        <Typography
          sx={{ bgcolor: 'primary.50', p: 2, borderRadius: 2, mt: 2 }}
        >
          Your password has been saved.
        </Typography>
      )}
    </>
  );
}
