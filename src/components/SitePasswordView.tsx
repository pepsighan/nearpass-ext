import React, { useCallback, useState } from 'react';
import { useAllSitePasswords, useDeletePassword } from '../store/sitePassword';
import {
  Button,
  Container,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
} from '@mui/material';
import { MdRemoveRedEye } from 'react-icons/md';
import { useBoolean } from 'react-use';
import { useSnackbar } from 'notistack';

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
  const onDelete = useCallback(async () => {
    if (!sure) {
      setSure(true);
    }

    await deletePassword(item.id);
    enqueueSnackbar('Successfully deleted your password.', { variant: 'success' });
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
          <Button variant="contained" color="error" onClick={onDelete}>
            {sure ? 'Are you sure?' : 'Delete Password'}
          </Button>
        </Stack>
      </Stack>
    </Container>
  ) : null;
}
