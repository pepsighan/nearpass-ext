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
            <Stack spacing={1}>
              <TextField label="Website" value={website} disabled />
              <TextField label="Username" value={username} disabled />
              <TextField
                label="Password"
                type="password"
                value={password}
                disabled
              />
            </Stack>
          )}

          <Button
            variant={website ? 'outlined' : 'contained'}
            fullWidth
            onClick={onOpenApp}
            sx={{ mt: 1 }}
          >
            View Manager
          </Button>
        </Box>
      </ThemeProvider>
    </>
  );
}
