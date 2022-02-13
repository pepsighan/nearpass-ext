import { AppBar, Toolbar } from '@mui/material';
import React from 'react';
import AccountButton from './AccountButton';

export default function Navigation() {
  return (
    <AppBar position="static" elevation={0} color="default">
      <Toolbar sx={{ justifyContent: 'flex-end' }}>
        <AccountButton />
      </Toolbar>
    </AppBar>
  );
}
