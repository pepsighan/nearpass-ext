import { AppBar, Box, Button, Toolbar } from '@mui/material';
import React from 'react';
import { useAccountId } from '../store/wallet';
import NearIcon from './NearIcon';

export default function Navigation() {
  const accountId = useAccountId();

  return (
    <AppBar position="static" elevation={0} color="default">
      <Toolbar sx={{ justifyContent: 'flex-end' }}>
        <Button variant="contained" color="inherit">
          <Box width={24} height={24} mr={0.5}>
            <NearIcon />
          </Box>
          {accountId}
        </Button>
      </Toolbar>
    </AppBar>
  );
}
