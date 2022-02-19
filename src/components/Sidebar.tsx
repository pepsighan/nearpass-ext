import {
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Toolbar,
} from '@mui/material';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const drawerWidth = 240;

export default function Sidebar() {
  const { pathname } = useLocation();

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Toolbar />
      <Divider sx={{ mt: '-1px' }} />
      <List>
        <ListItem button component={Link} to="/" selected={pathname === '/'}>
          <ListItemText primary="Passwords" />
        </ListItem>
        <ListItem
          button
          component={Link}
          to="/texts"
          selected={pathname === '/texts'}
        >
          <ListItemText primary="Texts" />
        </ListItem>
      </List>
    </Drawer>
  );
}
