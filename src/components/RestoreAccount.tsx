import {
  useGetAccountSignature,
  useMasterPassword,
  useSetMasterPassword,
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

const schema = z.object({
  masterPassword: z.string().min(8),
  encKey: z.string().min(1, 'Required'),
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
      encKey: '',
    },
    resolver: zodResolver(schema),
  });

  const verifyAccount = useVerifyAccount();
  const setMasterPassword = useSetMasterPassword();
  const onSubmit = useCallback(
    async (state) => {
      const isCorrect = await verifyAccount(state.encKey);
      if (!isCorrect) {
        setError('encKey', { message: 'Encryption key is incorrect' });
        return;
      }
      await setMasterPassword(state.masterPassword);
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
            label="Encryption key"
            fullWidth
            type="text"
            autoComplete="off"
            helperText={errors.encKey?.message}
            error={Boolean(errors.encKey)}
            multiline
            minRows={4}
            sx={{ mt: 2 }}
            {...materialRegister(register, 'encKey')}
          />
          <Typography variant="body2" color="textSecondary" mt={1}>
            Your encryption key for this account. If you have forgotten, you
            won&apos;t be able to recover your data.
          </Typography>

          <LoadingButton
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            loading={isSubmitting}
            sx={{ mt: 2 }}
          >
            Restore
          </LoadingButton>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
