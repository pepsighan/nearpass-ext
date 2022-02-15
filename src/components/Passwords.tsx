import { Container, Grid, Stack } from '@mui/material';
import React from 'react';
import NewSitePassword from './NewSitePassword';
import PasswordList from './PasswordList';

export default function Passwords() {
  return (
    <Grid container>
      <Grid
        item
        sx={{
          borderRight: '1px solid',
          borderRightColor: 'grey.300',
          height: 'calc(100vh - 64px)',
          overflow: 'auto',
        }}
      >
        <PasswordList />
      </Grid>
      <Grid item flex={1}>
        <Container>
          <Stack alignItems="flex-end" mt={2}>
            <NewSitePassword />
          </Stack>
        </Container>
      </Grid>
    </Grid>
  );
}
