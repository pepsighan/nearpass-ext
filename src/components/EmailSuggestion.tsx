import React, { useEffect, useMemo, useState } from 'react';
import { List, ListItem, ListItemText, Paper, Popper } from '@mui/material';
import { useAllSitePasswords } from '../store/sitePassword';

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

  const { data } = useAllSitePasswords();
  const usernames = useMemo(
    () =>
      data
        .filter((it) => {
          const hostname = new URL(it.website).hostname;
          const currentHost = window.location.hostname;

          return hostname === currentHost;
        })
        .map((it) => it.username),
    [data]
  );

  return (
    <Popper open={open && usernames.length > 0} anchorEl={anchorEl}>
      <Paper>
        <List sx={{ width: anchorEl?.clientWidth }}>
          {usernames.map((it, index) => (
            <ListItem
              key={index}
              button
              onClick={() => console.log('clicked here')}
            >
              <ListItemText>{it}</ListItemText>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Popper>
  );
}
