import { Container, Grid, Stack } from '@mui/material';
import React, { useState } from 'react';
import NewSitePassword from './NewSitePassword';
import PasswordList from './PasswordList';
import SitePasswordView from './SitePasswordView';

export default function Passwords() {
  const [currentPassIndex, setCurrentPassIndex] = useState(0);

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
        <PasswordList
          onSelect={setCurrentPassIndex}
          currentIndex={currentPassIndex}
        />
      </Grid>
      <Grid item flex={1}>
        <Container>
          <Stack alignItems="flex-end" mt={2}>
            <NewSitePassword />
          </Stack>
          <SitePasswordView
            key={currentPassIndex}
            currentPassIndex={currentPassIndex}
          />
        </Container>
      </Grid>
    </Grid>
  );
}
