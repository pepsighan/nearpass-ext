import React, { useState } from 'react';
import {
  Container,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
} from '@mui/material';
import { MdRemoveRedEye } from 'react-icons/md';
import { useAsyncFn, useBoolean } from 'react-use';
import { useAllTexts, useDeleteText } from '../store/text';
import { useSnackbar } from 'notistack';
import { LoadingButton } from '@mui/lab';

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
  const [{ loading }, onDelete] = useAsyncFn(async () => {
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
          <LoadingButton
            variant="contained"
            color="error"
            onClick={onDelete}
            loading={loading}
          >
            {sure ? 'Are you sure?' : 'Delete Text'}
          </LoadingButton>
        </Stack>
      </Stack>
    </Container>
  ) : null;
}
