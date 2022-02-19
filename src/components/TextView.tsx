import React from 'react';
import { useAllSitePasswords } from '../store/sitePassword';
import {
  Container,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
} from '@mui/material';
import { MdRemoveRedEye } from 'react-icons/md';
import { useBoolean } from 'react-use';

type TextViewProps = {
  currentTextIndex: number;
};

export default function TextView({ currentTextIndex }: TextViewProps) {
  const { data } = useAllSitePasswords();
  const item = (data ?? [])[currentTextIndex];

  const [visible, toggleVisible] = useBoolean(false);

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
        </Stack>
      </Stack>
    </Container>
  ) : null;
}
