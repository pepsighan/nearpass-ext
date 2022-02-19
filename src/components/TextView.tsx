import React from 'react';
import {
  Container,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
} from '@mui/material';
import { MdRemoveRedEye } from 'react-icons/md';
import { useBoolean } from 'react-use';
import { useAllTexts } from '../store/text';

type TextViewProps = {
  currentTextIndex: number;
};

export default function TextView({ currentTextIndex }: TextViewProps) {
  const { data } = useAllTexts();
  const item = (data ?? [])[currentTextIndex];

  const [visible, toggleVisible] = useBoolean(false);

  return item ? (
    <Container sx={{ mt: 8 }}>
      <Stack alignItems="center">
        <Stack spacing={2} maxWidth={400} width="100%">
          <TextField label="Title" fullWidth value={item.title} disabled />
          <TextField
            label="Content"
            fullWidth
            value={visible ? item.content : '****************'}
            disabled
            multiline
            minRows={6}
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
