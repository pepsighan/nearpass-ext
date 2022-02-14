import { Stack, Typography } from '@mui/material';
import React from 'react';
import Navigation from './Navigation';
import Sidebar from './Sidebar';

export default function Dashboard() {
  return (
    <>
      <Sidebar />
      <Navigation />
      <Typography>Nearpass</Typography>
    </>
  );
}
