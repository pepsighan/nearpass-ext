import {
  useGetAccountSignature,
  useMasterPassword,
  useVerifyAccount,
} from '../store/account';
import { useForm } from 'react-hook-form';
import React, { useCallback } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { materialRegister } from '../materialRegister';
import { LoadingButton } from '@mui/lab';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { pki } from 'node-forge';

const schema = z.object({
  masterPassword: z.string().min(8),
  privateKeyPem: z.string().refine(
    (v) => {
      try {
        pki.privateKeyFromPem(v);
        return true;
      } catch (err) {
        return false;
      }
    },
    { message: 'Invalid private key' }
  ),
});

export default function RestoreAccount() {
  const [{ value: signature, loading }] = useGetAccountSignature();
  const isPasswordPresent = Boolean(useMasterPassword());

  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
    setError,
  } = useForm({
    defaultValues: {
      masterPassword: '',
      privateKeyPem: '',
    },
    resolver: zodResolver(schema),
  });

  const verifyAccount = useVerifyAccount();
  const onSubmit = useCallback(
    async (state) => {
      // TODO: Store the master password.

      const isCorrect = await verifyAccount(state.privateKeyPem);
      if (!isCorrect) {
        setError('privateKeyPem', { message: 'Private key is incorrect' });
      }
    },
    [verifyAccount]
  );

  return (
    <Dialog open={!loading && Boolean(signature) && !isPasswordPresent}>
      <DialogTitle>Restore Nearpass</DialogTitle>

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
            Provide a new password for the account.
          </Typography>

          <TextField
            label="Private key"
            fullWidth
            type="text"
            autoComplete="off"
            helperText={errors.privateKeyPem?.message}
            error={Boolean(errors.privateKeyPem)}
            multiline
            minRows={4}
            sx={{ mt: 2 }}
            {...materialRegister(register, 'privateKeyPem')}
          />

          <LoadingButton
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            loading={isSubmitting}
            sx={{ mt: 2 }}
          >
            Unlock
          </LoadingButton>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
