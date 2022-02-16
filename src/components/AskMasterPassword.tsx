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
    },
  });

  const verifyMasterPassword = useVerifyMasterPassword();
  const onSubmit = useCallback(
    async (state) => {
      const isCorrect = await verifyMasterPassword(state.masterPassword);
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
