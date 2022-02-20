import { ThemeProvider } from '@mui/material';
import React from 'react';
import theme from '../../config/theme';
import UsernameSuggestion from '../../components/UsernameSuggestion';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useInitializeWallet } from '../../store/wallet';
import PasswordSuggestion from '../../components/PasswordSuggestion';
import PasswordSaveDetection from '../../components/PasswordSaveDetection';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
});

/**
 * Content script which does the following two tasks at the moment:
 * 1. Username and password suggestion during logins.
 * 2. When logging in, suggests the user to save their credentials.
 */
export default function App() {
  useInitializeWallet();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <UsernameSuggestion />
        <PasswordSuggestion />
        <PasswordSaveDetection />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
