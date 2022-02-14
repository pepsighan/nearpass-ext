import React from 'react';
import { ThemeProvider } from '@mui/material';
import theme from '../../config/theme';
import BaseStyles from '../../components/BaseStyles';
import { HashRouter } from 'react-router-dom';
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
        <HashRouter>{accountId ? <Dashboard /> : <NearLogin />}</HashRouter>
      </ThemeProvider>
    </>
  );
}
