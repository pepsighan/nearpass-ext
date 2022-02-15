import React, { useCallback } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useBoolean } from 'react-use';

export default function NewSitePassword() {
  const [open, toggleOpen] = useBoolean(false);
  const onOpen = useCallback(() => toggleOpen(true), [toggleOpen]);
  const onClose = useCallback(() => toggleOpen(false), [toggleOpen]);

  return (
    <>
      <Button variant="contained" onClick={onOpen}>
        Add Password
      </Button>

      <Dialog open={open} fullWidth onClose={onClose}>
        <DialogTitle>New Password</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Typography color="textSecondary">
              Fill in the form with the credentials for a website. All of this
              information is going to be stored after encrypting it by your
              master password.
            </Typography>
            <TextField label="Website" fullWidth />
            <TextField label="Username" fullWidth />
            <TextField label="Password" fullWidth />
            <Button variant="contained" size="large" fullWidth>
              Save
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
