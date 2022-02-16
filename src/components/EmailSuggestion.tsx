import React, { useEffect, useState } from 'react';
import { List, ListItem, ListItemText, Paper, Popper } from '@mui/material';

export default function EmailSuggestion() {
  const [anchorEl, setAnchorEl] = useState<any>(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    const username = document.querySelector(
      `input[name="email"],input[name="username"],input[type="email"],
                input[autocomplete="username"],input[autocomplete="email"]`
    );
    if (!username) {
      return;
    }

    const onFocus = () => {
      setAnchorEl(username);
    };
    const onUnfocus = () => {
      // Do not immediately close on focus out because the ListItem might have
      // been clicked. So wait for it to be triggered.
      setTimeout(() => setAnchorEl(null), 100);
    };

    username.addEventListener('focusin', onFocus);
    username.addEventListener('focusout', onUnfocus);

    return () => {
      username.removeEventListener('onfocus', onFocus);
      username.removeEventListener('focusout', onUnfocus);
    };
  }, [setAnchorEl]);

  return (
    <Popper open={open} anchorEl={anchorEl}>
      <Paper>
        <List sx={{ width: anchorEl?.clientWidth }}>
          <ListItem button onClick={() => console.log('clicked here')}>
            <ListItemText>Username</ListItemText>
          </ListItem>
        </List>
      </Paper>
    </Popper>
  );
}