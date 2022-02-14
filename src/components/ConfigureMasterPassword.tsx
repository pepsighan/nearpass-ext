import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import React, { useCallback } from 'react';
import { useIsMasterPasswordIsConfigured } from '../store/master';
import { useForm } from 'react-hook-form';
import { materialRegister } from '../materialRegister';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z
  .object({
    masterPassword: z.string().min(8),
    repeatPassword: z.string(),
  })
  .refine((val) => val.masterPassword === val.repeatPassword, {
    message: 'Password does not match',
    path: ['repeatPassword'],
  });

export default function ConfigureMasterPassword() {
  const { value, loading } = useIsMasterPasswordIsConfigured();
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    defaultValues: {
      masterPassword: '',
      repeatPassword: '',
    },
    resolver: zodResolver(schema),
  });

  const onSubmit = useCallback((state) => {}, []);

  return (
    <Dialog open={!loading && !Boolean(value)}>
      <DialogTitle>Set Master Password</DialogTitle>

      <DialogContent>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <TextField
            label="Master Password"
            fullWidth
            type="password"
            helperText={errors.masterPassword?.message}
            error={Boolean(errors.masterPassword)}
            sx={{ mt: 2 }}
            {...materialRegister(register, 'masterPassword')}
          />
          <Typography variant="body2" color="textSecondary" mt={1}>
            This password will encrypt everything that you store within the app.
            So, keep it safe otherwise your saved passwords may get lost.
          </Typography>

          <TextField
            label="Repeat Password"
            fullWidth
            type="password"
            helperText={errors.repeatPassword?.message}
            error={Boolean(errors.repeatPassword)}
            sx={{ mt: 2 }}
            {...materialRegister(register, 'repeatPassword')}
          />
          <Typography variant="body2" color="textSecondary" mt={1}>
            Also, rest assured that this password won't leave your device.
          </Typography>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            sx={{ mt: 2 }}
          >
            Save Password
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
