import React, { useCallback } from 'react';
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

export default function App() {
  const onOpenApp = useCallback(() => {
    window.open(chrome.runtime.getURL('app.html'));
  }, []);

  const { website, username, password } = useTempSitePassword();

  return (
    <>
      <BaseStyles />
      <ThemeProvider theme={theme}>
        <Box sx={{ pt: 2, pb: 2, px: 2, minWidth: 300 }}>
          <Typography variant="h6" textAlign="center">
            Nearpass
          </Typography>

          {website && (
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
                <Button variant="contained" type="submit">
                  Save Password
                </Button>
              </Stack>
            </>
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
