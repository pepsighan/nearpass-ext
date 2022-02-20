import React, { useEffect, useMemo, useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Paper,
  Popper,
  Typography,
} from '@mui/material';
import { useAllSitePasswords } from '../store/sitePassword';

export default function PasswordSuggestion() {
  const [anchorEl, setAnchorEl] = useState<any>(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    const password = document.querySelector('input[type="password"]');
    if (!password) {
      return;
    }

    const onFocus = () => {
      setAnchorEl(password);
    };
    const onUnfocus = () => {
      // Do not immediately close on focus out because the ListItem might have
      // been clicked. So wait for it to be triggered.
      setTimeout(() => setAnchorEl(null), 100);
    };

    password.addEventListener('focusin', onFocus);
    password.addEventListener('focusout', onUnfocus);

    return () => {
      password.removeEventListener('onfocus', onFocus);
      password.removeEventListener('focusout', onUnfocus);
    };
  }, [setAnchorEl]);

  const { data } = useAllSitePasswords();
  const passwords = useMemo(
    () =>
      data.filter((it) => {
        const hostname = new URL(it.website).hostname;
        const currentHost = window.location.hostname;

        return hostname === currentHost;
      }),
    [data]
  );

  return (
    <Popper open={open && passwords.length > 0} anchorEl={anchorEl}>
      <Paper>
        <List sx={{ width: anchorEl?.clientWidth }}>
          {passwords.map((it, index) => (
            <ListItem
              key={index}
              button
              onClick={() => {
                anchorEl.value = it.password;
              }}
            >
              <ListItemText disableTypography>
                <Typography variant="body2" color="textSecondary">
                  {it.username}
                </Typography>
                <Typography>{'*'.repeat(it.password.length)}</Typography>
              </ListItemText>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Popper>
  );
}
