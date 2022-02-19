import React, { useCallback } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useBoolean } from 'react-use';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { materialRegister } from '../materialRegister';
import { useSnackbar } from 'notistack';
import { LoadingButton } from '@mui/lab';
import { useAddText } from '../store/text';

const schema = z.object({
  title: z.string().min(1, 'Required'),
  content: z.string().min(1, 'Required'),
});

export default function NewText() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      title: '',
      content: '',
    },
    resolver: zodResolver(schema),
  });

  const [open, toggleOpen] = useBoolean(false);
  const onOpen = useCallback(() => toggleOpen(true), [toggleOpen]);
  const onClose = useCallback(() => {
    toggleOpen(false);
    reset();
  }, [toggleOpen]);

  const { enqueueSnackbar } = useSnackbar();

  const addText = useAddText();
  const onSubmit = useCallback(
    async (state) => {
      await addText(state);
      onClose();
      enqueueSnackbar('Added your text securely.', { variant: 'success' });
    },
    [addText, onClose]
  );

  return (
    <>
      <Button variant="contained" onClick={onOpen}>
        Add Text
      </Button>

      <Dialog open={open} fullWidth onClose={onClose}>
        <DialogTitle>New Text</DialogTitle>
        <DialogContent>
          <Stack component="form" spacing={2} onSubmit={handleSubmit(onSubmit)}>
            <Typography color="textSecondary">
              Fill in the form with the credentials for a website. All of this
              information is going to be stored after encrypting it by your
              encryption key.
            </Typography>
            <TextField
              label="Title"
              fullWidth
              helperText={errors.title?.message}
              error={Boolean(errors.title)}
              {...materialRegister(register, 'title')}
            />
            <TextField
              label="Content"
              fullWidth
              helperText={errors.content?.message}
              error={Boolean(errors.content)}
              multiline
              minRows={6}
              {...materialRegister(register, 'content')}
            />
            <LoadingButton
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              loading={isSubmitting}
            >
              Save
            </LoadingButton>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
