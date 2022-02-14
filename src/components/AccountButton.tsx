import { Box, Button, Menu, MenuItem, Typography } from '@mui/material';
import NearIcon from './NearIcon';
import React, { useCallback } from 'react';
import { useAccountId, useLogout } from '../store/wallet';
import {
  bindMenu,
  bindTrigger,
  usePopupState,
} from 'material-ui-popup-state/hooks';

export default function AccountButton() {
  const accountId = useAccountId();
  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'account-menu',
  });

  const logout = useLogout();
  const onLogout = useCallback(() => {
    logout();
    popupState.close();
  }, [logout, popupState]);

  return (
    <>
      <Button variant="contained" color="inherit" {...bindTrigger(popupState)}>
        <Box width={24} height={24} mr={0.5}>
          <NearIcon />
        </Box>
        {accountId}
      </Button>

      <Menu {...bindMenu(popupState)} elevation={1}>
        <MenuItem onClick={onLogout} sx={{ width: 200 }}>
          <Typography>Logout</Typography>
        </MenuItem>
      </Menu>
    </>
  );
}
