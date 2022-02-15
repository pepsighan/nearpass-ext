import {
  Container,
  Grid,
  List,
  ListItem,
  ListItemText,
  Stack,
} from '@mui/material';
import React from 'react';
import NewSitePassword from './NewSitePassword';

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
        <List sx={{ minWidth: 200 }}>
          {Array(20)
            .fill(0)
            .map((_, index) => (
              <ListItem key={index} button>
                <ListItemText primary="Passwords" />
              </ListItem>
            ))}
        </List>
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
