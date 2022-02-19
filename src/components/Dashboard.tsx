import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Navigation from './Navigation';
import Sidebar, { drawerWidth } from './Sidebar';
import Passwords from './Passwords';
import Settings from './Settings';
import { Box } from '@mui/material';
import InitiateNewAccount from './InitiateNewAccount';
import RestoreAccount from './RestoreAccount';
import { Helmet } from 'react-helmet';

export default function Dashboard() {
  return (
    <>
      <Helmet>
        <title>Nearpass</title>
      </Helmet>

      <Sidebar />
      <Navigation />
      <Box ml={`${drawerWidth}px`}>
        <Routes>
          <Route path="/" element={<Passwords />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Box>
      <InitiateNewAccount />
      <RestoreAccount />
    </>
  );
}
