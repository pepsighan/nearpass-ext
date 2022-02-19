import React, { useCallback, useState } from 'react';
import { useAllSitePasswords, useDeletePassword } from '../store/sitePassword';
import {
  Container,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
} from '@mui/material';
import { MdRemoveRedEye } from 'react-icons/md';
import { useAsyncFn, useBoolean } from 'react-use';
import { useSnackbar } from 'notistack';
import { LoadingButton } from '@mui/lab';

type SitePasswordViewProps = {
  currentPassIndex: number;
};

export default function SitePasswordView({
  currentPassIndex,
}: SitePasswordViewProps) {
  const { data } = useAllSitePasswords();
  const item = (data ?? [])[currentPassIndex];

  const [visible, toggleVisible] = useBoolean(false);
  const [sure, setSure] = useState(false);

  const { enqueueSnackbar } = useSnackbar();
  const deletePassword = useDeletePassword();

  const onConfirm = useCallback(() => setSure(true), []);
  const [{ loading }, onDelete] = useAsyncFn(async () => {
    await deletePassword(item.id);
    enqueueSnackbar('Successfully deleted your password.', {
      variant: 'success',
    });
  }, [sure, setSure, deletePassword, enqueueSnackbar, item]);

  return item ? (
    <Container sx={{ mt: 8 }}>
      <Stack alignItems="center">
        <Stack spacing={2} maxWidth={400} width="100%">
          <TextField label="Website" fullWidth value={item.website} disabled />
          <TextField
            label="Username"
            fullWidth
            value={item.username}
            disabled
          />
          <TextField
            label="Password"
            fullWidth
            value={visible ? item.password : '****************'}
            disabled
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={toggleVisible}>
                    <MdRemoveRedEye />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <LoadingButton
            variant="contained"
            color="error"
            onClick={sure ? onDelete : onConfirm}
            loading={loading}
          >
            {sure ? 'Are you sure?' : 'Delete Password'}
          </LoadingButton>
        </Stack>
      </Stack>
    </Container>
  ) : null;
}
