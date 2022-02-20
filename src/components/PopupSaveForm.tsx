import { Button, Stack, TextField, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { useTempSitePassword } from '../store/tempSitePassword';
import { useAddSitePassword } from '../store/sitePassword';
import { BackgroundMessage } from '../messages';

export default function PopupSaveForm() {
  const [saved, setSaved] = useState(false);
  const { website, username, password, forgetPassword } = useTempSitePassword();

  const addSitePassword = useAddSitePassword();
  const onSave = useCallback(async () => {
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
  }, [addSitePassword, website, username, password]);

  return (
    <>
      {!saved && website && (
        <>
          <Typography variant="body2" textAlign="center" color="textSecondary">
            You just logged in with the following credentials. Save them on
            Nearpass?
          </Typography>

          <Stack component="form" spacing={2} sx={{ mt: 3 }}>
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
            <Button variant="contained" type="submit" onClick={onSave}>
              Save Password
            </Button>
          </Stack>
        </>
      )}

      {saved && (
        <Typography sx={{ bgcolor: 'primary.50', p: 2, borderRadius: 2 }}>
          Your password has been saved.
        </Typography>
      )}
    </>
  );
}