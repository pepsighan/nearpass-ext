import React from 'react';
import { ThemeProvider } from '@mui/material';
import theme from '../../config/theme';
import BaseStyles from '../../components/BaseStyles';

export default function App() {
  return (
    <>
      <BaseStyles />
      <ThemeProvider theme={theme}>Nearpass</ThemeProvider>
    </>
  );
}
