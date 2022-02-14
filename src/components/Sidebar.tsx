import {
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Toolbar,
} from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';

export const drawerWidth = 240;

export default function Sidebar() {
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
        <ListItem button component={Link} to="/">
          <ListItemText primary="Passwords" />
        </ListItem>
        <ListItem button component={Link} to="/settings">
          <ListItemText primary="Settings" />
        </ListItem>
      </List>
    </Drawer>
  );
}
