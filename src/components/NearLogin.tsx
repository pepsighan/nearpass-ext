import { Button, Container, Stack, Typography } from '@mui/material';
import React from 'react';
import { Helmet } from 'react-helmet';
import { useLogin } from '../store/wallet';

export default function NearLogin() {
  const login = useLogin();

  return (
    <Container>
      <Helmet>
        <title>Nearpass - Login</title>
      </Helmet>

      <Stack alignItems="center" justifyContent="center" minHeight="100vh">
        <Typography variant="h3" textAlign="center">
          Nearpass
        </Typography>
        <Typography
          component="p"
          color="textSecondary"
          textAlign="center"
          variant="h6"
          fontWeight="normal"
          mt={0.5}
        >
          Connect your NEAR wallet to view and store your passwords
        </Typography>

        <Button variant="contained" size="large" sx={{ mt: 6 }} onClick={login}>
          Connect with NEAR Wallet
        </Button>
      </Stack>
    </Container>
  );
}
