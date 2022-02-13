import { createTheme } from '@mui/material';
import { deepOrange } from '@mui/material/colors';

export default createTheme({
  palette: {
    primary: deepOrange,
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'initial',
        },
      },
    },
  },
});
