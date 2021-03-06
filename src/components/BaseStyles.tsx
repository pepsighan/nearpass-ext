import { Helmet } from 'react-helmet';
import React from 'react';
import { CssBaseline, GlobalStyles } from '@mui/material';

export default function BaseStyles() {
  return (
    <>
      <Helmet>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
      </Helmet>
      <CssBaseline />
      <GlobalStyles
        styles={`
          html {
            font-size: 14px;
          }
        `}
      />
    </>
  );
}
