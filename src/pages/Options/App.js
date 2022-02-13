import React from 'react';
import { ThemeProvider } from '@mui/material';
import theme from '../../config/theme';
import BaseStyles from '../../components/BaseStyles';
import { HashRouter, Route, Routes } from 'react-router-dom';
import Home from './routes/Home';

export default function App() {
  return (
    <>
      <BaseStyles />
      <ThemeProvider theme={theme}>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </HashRouter>
      </ThemeProvider>
    </>
  );
}
