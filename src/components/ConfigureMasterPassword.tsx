import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import React from 'react';
import { useIsMasterPasswordIsConfigured } from '../store/master';

export default function ConfigureMasterPassword() {
  const { value, loading } = useIsMasterPasswordIsConfigured();

  return (
    <Dialog open={!loading && !Boolean(value)}>
      <DialogTitle>Set Master Password</DialogTitle>

      <DialogContent>
        <TextField
          label="Master Password"
          fullWidth
          type="password"
          sx={{ mt: 2 }}
        />
        <Typography variant="body2" color="textSecondary" mt={1}>
          This password will encrypt everything that you store within the app.
          So, keep it safe otherwise your saved passwords may get lost.
        </Typography>

        <TextField
          label="Repeat Password"
          fullWidth
          type="password"
          sx={{ mt: 2 }}
        />
        <Typography variant="body2" color="textSecondary" mt={1}>
          Also, rest assured that this password won't leave your device.
        </Typography>

        <Button variant="contained" fullWidth size="large" sx={{ mt: 2 }}>
          Save Password
        </Button>
      </DialogContent>
    </Dialog>
  );
}
