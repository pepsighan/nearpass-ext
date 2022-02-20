import React, { useCallback, useState } from 'react';
import {
  Box,
  Button,
  Stack,
  TextField,
  ThemeProvider,
  Typography,
} from '@mui/material';
import theme from '../../config/theme';
import BaseStyles from '../../components/BaseStyles';
import { useTempSitePassword } from '../../store/tempSitePassword';
import { useAddSitePassword } from '../../store/sitePassword';
import { BackgroundMessage } from '../../messages';

export default function App() {
  const onOpenApp = useCallback(() => {
    window.open(chrome.runtime.getURL('app.html'));
  }, []);

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
      <BaseStyles />
      <ThemeProvider theme={theme}>
        <Box sx={{ pt: 2, pb: 2, px: 2, minWidth: 300 }}>
          <Typography variant="h6" textAlign="center">
            Nearpass
          </Typography>

          {!saved && website && (
            <>
              <Typography
                variant="body2"
                textAlign="center"
                color="textSecondary"
              >
                You just logged in with the following credentials. Save them on
                Nearpass?
              </Typography>

              <Stack component="form" spacing={2} sx={{ mt: 3 }}>
                <TextField
                  label="Website"
                  value={website}
                  size="small"
                  disabled
                />
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

          <Button
            variant={website ? 'outlined' : 'contained'}
            fullWidth
            onClick={onOpenApp}
            sx={{ mt: 2 }}
          >
            View Manager
          </Button>
        </Box>
      </ThemeProvider>
    </>
  );
}
