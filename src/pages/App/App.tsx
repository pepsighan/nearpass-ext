import React from 'react';
import { ThemeProvider } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { HashRouter } from 'react-router-dom';
import theme from '../../config/theme';
import BaseStyles from '../../components/BaseStyles';
import { useAccountId, useInitializeWallet } from '../../store/wallet';
import Dashboard from '../../components/Dashboard';
import NearLogin from '../../components/NearLogin';

export default function App() {
  useInitializeWallet();
  const accountId = useAccountId();

  return (
    <>
      <BaseStyles />
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <HashRouter>{accountId ? <Dashboard /> : <NearLogin />}</HashRouter>
        </SnackbarProvider>
      </ThemeProvider>
    </>
  );
}
