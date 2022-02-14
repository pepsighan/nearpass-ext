import { Dialog, DialogTitle } from '@mui/material';
import React from 'react';
import { useIsMasterPasswordIsConfigured } from '../store/master';

export default function ConfigureMasterPassword() {
  const { value, loading } = useIsMasterPasswordIsConfigured();

  return (
    <Dialog open={!loading && !Boolean(value)}>
      <DialogTitle>Set Master Password</DialogTitle>
    </Dialog>
  );
}
