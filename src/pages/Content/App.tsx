import { ThemeProvider } from '@mui/material';
import React from 'react';
import theme from '../../config/theme';
import EmailSuggestion from '../../components/EmailSuggestion';

export default function App() {
  return (
    <>
      <ThemeProvider theme={theme}>
        <EmailSuggestion />
      </ThemeProvider>
    </>
  );
}
