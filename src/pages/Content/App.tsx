import { ThemeProvider } from '@mui/material';
import React from 'react';
import theme from '../../config/theme';
import UsernameSuggestion from '../../components/UsernameSuggestion';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useInitializeWallet } from '../../store/wallet';
import PasswordSuggestion from '../../components/PasswordSuggestion';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
});

export default function App() {
  useInitializeWallet();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <UsernameSuggestion />
        <PasswordSuggestion />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
