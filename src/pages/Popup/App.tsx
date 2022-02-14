import React, { useCallback } from 'react';
import { Box, Button, ThemeProvider } from '@mui/material';
import theme from '../../config/theme';
import BaseStyles from '../../components/BaseStyles';

export default function App() {
  const onOpenApp = useCallback(() => {
    window.open(chrome.runtime.getURL('app.html'));
  }, []);

  return (
    <>
      <BaseStyles />
      <ThemeProvider theme={theme}>
        <Box sx={{ p: 2, minWidth: 200 }}>
          <Button variant="contained" onClick={onOpenApp}>
            Open App
          </Button>
        </Box>
      </ThemeProvider>
    </>
  );
}
