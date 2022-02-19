import React, { useCallback, useState } from 'react';
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
import { useAllTexts, useDeleteText } from '../store/text';
import { useSnackbar } from 'notistack';

type TextViewProps = {
  currentTextIndex: number;
};

export default function TextView({ currentTextIndex }: TextViewProps) {
  const { data } = useAllTexts();
  const item = (data ?? [])[currentTextIndex];

  const [visible, toggleVisible] = useBoolean(false);
  const [sure, setSure] = useState(false);

  const { enqueueSnackbar } = useSnackbar();
  const deleteText = useDeleteText();
  const onDelete = useCallback(async () => {
    if (!sure) {
      setSure(true);
    }

    await deleteText(item.id);
    enqueueSnackbar('Successfully deleted your text.', { variant: 'success' });
  }, [sure, setSure, item, deleteText, enqueueSnackbar]);

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
          <Button variant="contained" color="error" onClick={onDelete}>
            {sure ? 'Are you sure?' : 'Delete Text'}
          </Button>
        </Stack>
      </Stack>
    </Container>
  ) : null;
}
