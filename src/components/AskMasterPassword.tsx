import {
  useGetAccountHash,
  useMasterPassword,
  useVerifyMasterPassword,
} from '../store/master';
import { useForm } from 'react-hook-form';
import React, { useCallback } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
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

export default function AskMasterPassword() {
  const [{ value: hash, loading }] = useGetAccountHash();
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

  const verifyMasterPassword = useVerifyMasterPassword();
  const onSubmit = useCallback(
    async (state) => {
      const isCorrect = await verifyMasterPassword(
        state.masterPassword,
        state.privateKeyPem
      );
      if (!isCorrect) {
        setError('masterPassword', { message: 'Master password is incorrect' });
      }
    },
    [verifyMasterPassword]
  );

  return (
    <Dialog open={!loading && Boolean(hash) && !isPasswordPresent}>
      <DialogTitle>Unlock Nearpass</DialogTitle>

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

          <TextField
            label="Private key PEM"
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
