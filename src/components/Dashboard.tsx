import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Navigation from './Navigation';
import Sidebar, { drawerWidth } from './Sidebar';
import Passwords from './Passwords';
import Settings from './Settings';
import { Box } from '@mui/material';

export default function Dashboard() {
  return (
    <>
      <Sidebar />
      <Navigation />
      <Box ml={`${drawerWidth}px`}>
        <Routes>
          <Route path="/" element={<Passwords />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Box>
    </>
  );
}
