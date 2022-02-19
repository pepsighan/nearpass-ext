import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import React, { useCallback, useState } from 'react';
import {
  useGetAccountSignature,
  useInitiateAccount,
  useSetMasterPassword,
} from '../store/account';
import { useForm } from 'react-hook-form';
import { materialRegister } from '../materialRegister';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { MdRemoveRedEye } from 'react-icons/md';
import { useBoolean, useCopyToClipboard } from 'react-use';

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
  const [encKey, setEncKey] = useState<string | null>(null);
  const [shown, toggleShown] = useBoolean(false);
  const onCloseEncKeyDialog = useCallback(() => setEncKey(null), [setEncKey]);

  const [{ value }, copyToClipboard] = useCopyToClipboard();
  const onCopy = useCallback(
    () => (encKey ? copyToClipboard(encKey) : null),
    [encKey, copyToClipboard]
  );

  const [{ value: accountSignature, loading }, refetch] =
    useGetAccountSignature();
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
  const setMasterPassword = useSetMasterPassword();
  const onSubmit = useCallback(
    async (state) => {
      const key = await initiateAccount();
      await refetch();
      await setMasterPassword(state.masterPassword);
      setEncKey(key);
    },
    [setEncKey, refetch]
  );

  return (
    <>
      <Dialog open={!loading && !Boolean(accountSignature)}>
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

      <Dialog open={Boolean(encKey)}>
        <DialogTitle>Your Encryption Key</DialogTitle>
        <DialogContent>
          <Typography>
            The encryption key is required to encrypt your data on-chain.
          </Typography>
          <Typography sx={{ mt: 1 }}>
            Note down your encryption key somewhere safe. If you forget this,
            all your passwords will be irrecoverable.
          </Typography>

          <Typography
            sx={{
              fontFamily: 'monospace',
              p: 2,
              bgcolor: 'grey.100',
              mt: 1,
              borderRadius: 2,
              wordWrap: 'break-word',
            }}
          >
            {shown ? encKey : '*'.repeat(encKey?.length ?? 0)}

            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                size="small"
                sx={{ mr: 2 }}
                onClick={onCopy}
              >
                {value === encKey ? 'Copied' : 'Copy'}
              </Button>
              <IconButton size="small" onClick={toggleShown}>
                <MdRemoveRedEye />
              </IconButton>
            </Box>
          </Typography>

          <Button
            variant="contained"
            fullWidth
            size="large"
            sx={{ mt: 2 }}
            onClick={onCloseEncKeyDialog}
          >
            I have noted
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
