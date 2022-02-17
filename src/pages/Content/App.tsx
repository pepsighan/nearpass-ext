import { ThemeProvider } from '@mui/material';
import React from 'react';
import theme from '../../config/theme';
import EmailSuggestion from '../../components/EmailSuggestion';
import { QueryClient, QueryClientProvider } from 'react-query';
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

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <EmailSuggestion />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
