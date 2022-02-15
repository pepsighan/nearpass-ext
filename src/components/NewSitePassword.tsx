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
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { materialRegister } from '../materialRegister';
import { useAddSitePassword } from '../store/sitePassword';

const schema = z.object({
  website: z.string().url(),
  username: z.string().min(1, 'Required'),
  password: z.string().min(1, 'Required'),
});

export default function NewSitePassword() {
  const [open, toggleOpen] = useBoolean(false);
  const onOpen = useCallback(() => toggleOpen(true), [toggleOpen]);
  const onClose = useCallback(() => toggleOpen(false), [toggleOpen]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      website: '',
      username: '',
      password: '',
    },
    resolver: zodResolver(schema),
  });

  const addSitePassword = useAddSitePassword();
  const onSubmit = useCallback(
    async (state) => {
      await addSitePassword(state);
      onClose();
    },
    [addSitePassword, onClose]
  );

  return (
    <>
      <Button variant="contained" onClick={onOpen}>
        Add Password
      </Button>

      <Dialog open={open} fullWidth onClose={onClose}>
        <DialogTitle>New Password</DialogTitle>
        <DialogContent>
          <Stack component="form" spacing={2} onSubmit={handleSubmit(onSubmit)}>
            <Typography color="textSecondary">
              Fill in the form with the credentials for a website. All of this
              information is going to be stored after encrypting it by your
              master password.
            </Typography>
            <TextField
              label="Website"
              fullWidth
              helperText={errors.website?.message}
              error={Boolean(errors.website)}
              {...materialRegister(register, 'website')}
            />
            <TextField
              label="Username"
              fullWidth
              helperText={errors.username?.message}
              error={Boolean(errors.username)}
              {...materialRegister(register, 'username')}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              helperText={errors.password?.message}
              error={Boolean(errors.password)}
              {...materialRegister(register, 'password')}
            />
            <Button type="submit" variant="contained" size="large" fullWidth>
              Save
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
