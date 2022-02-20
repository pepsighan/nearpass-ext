import React, { useCallback } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Box, Button, ThemeProvider, Typography } from '@mui/material';
import theme from '../../config/theme';
import BaseStyles from '../../components/BaseStyles';
import { useTempSitePassword } from '../../store/tempSitePassword';
import PopupSaveForm from '../../components/PopupSaveForm';
import { useInitializeWallet } from '../../store/wallet';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
});

export default function App() {
  useInitializeWallet();

  const onOpenApp = useCallback(() => {
    window.open(chrome.runtime.getURL('app.html'));
  }, []);
  const isForm = useTempSitePassword(
    useCallback((state) => Boolean(state.website), [])
  );

  return (
    <QueryClientProvider client={queryClient}>
      <BaseStyles />
      <ThemeProvider theme={theme}>
        <Box sx={{ pt: 2, pb: 2, px: 2, minWidth: 340 }}>
          <Typography variant="h6" textAlign="center">
            Nearpass
          </Typography>

          <PopupSaveForm />

          <Button
            variant={isForm ? 'outlined' : 'contained'}
            color={isForm ? 'secondary' : 'primary'}
            fullWidth
            onClick={onOpenApp}
            sx={{ mt: 2 }}
          >
            View Manager
          </Button>
        </Box>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
