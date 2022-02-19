import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import React, { useCallback, useState } from 'react';
import { useGetAccountHash, useInitiateAccount } from '../store/master';
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

export default function InitiateNewAccount() {
  const [pemText, setPemText] = useState<string | null>(null);
  const onClosePemDialog = useCallback(() => setPemText(null), [setPemText]);

  const [{ value, loading }, refetch] = useGetAccountHash();
  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm({
    defaultValues: {
      masterPassword: '',
      repeatPassword: '',
    },
    resolver: zodResolver(schema),
  });

  const initiateAccount = useInitiateAccount();
  const onSubmit = useCallback(
    async (state) => {
      // TODO: Store the master password for locally.
      const pem = await initiateAccount();
      await refetch();
      setPemText(pem);
    },
    [setPemText, refetch]
  );

  return (
    <>
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
              Provide a new password for the account.
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

            <LoadingButton
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              loading={isSubmitting}
              sx={{ mt: 2 }}
            >
              Save Password
            </LoadingButton>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(pemText)} fullWidth maxWidth="xl">
        <DialogTitle>Your Private Key</DialogTitle>
        <DialogContent>
          <Typography>
            The private key is required to encrypt your data on-chain.
          </Typography>
          <Typography sx={{ mt: 1 }}>
            Note down your private key somewhere safe. If you forget this, all
            your passwords will be irrecoverable.
          </Typography>

          <Typography
            sx={{
              fontFamily: 'monospace',
              p: 2,
              bgcolor: 'grey.100',
              mt: 1,
              borderRadius: 2,
            }}
          >
            {pemText}
          </Typography>

          <Button
            variant="contained"
            fullWidth
            size="large"
            sx={{ mt: 2 }}
            onClick={onClosePemDialog}
          >
            I have noted
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
