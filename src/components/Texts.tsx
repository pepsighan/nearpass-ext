import { Container, Grid, Stack } from '@mui/material';
import React, { useState } from 'react';
import TextList from './TextList';
import NewText from './NewText';
import TextView from './TextView';

export default function Texts() {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

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
        <TextList onSelect={setCurrentTextIndex} />
      </Grid>
      <Grid item flex={1}>
        <Container>
          <Stack alignItems="flex-end" mt={2}>
            <NewText />
          </Stack>
          <TextView
            key={currentTextIndex}
            currentTextIndex={currentTextIndex}
          />
        </Container>
      </Grid>
    </Grid>
  );
}
