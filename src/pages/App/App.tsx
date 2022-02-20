import React from 'react';
import { ThemeProvider } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { HashRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import theme from '../../config/theme';
import BaseStyles from '../../components/BaseStyles';
import { useAccountId, useInitializeWallet } from '../../store/wallet';
import Dashboard from '../../components/Dashboard';
import NearLogin from '../../components/NearLogin';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
});

/**
 * The app which manages the passwords and texts for the user.
 */
export default function App() {
  useInitializeWallet();
  const accountId = useAccountId();

  return (
    <>
      <BaseStyles />
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <QueryClientProvider client={queryClient}>
            <HashRouter>{accountId ? <Dashboard /> : <NearLogin />}</HashRouter>
          </QueryClientProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </>
  );
}
