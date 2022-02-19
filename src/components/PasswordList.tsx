import { List, ListItem, ListItemText } from '@mui/material';
import React from 'react';
import { useAllSitePasswords } from '../store/sitePassword';

type PasswordListProps = {
  currentIndex: number;
  onSelect: (index: number) => void;
};

export default function PasswordList({
  currentIndex,
  onSelect,
}: PasswordListProps) {
  const { data, isLoading } = useAllSitePasswords();

  return (
    <List sx={{ minWidth: 200 }}>
      {(data ?? []).map((pass, index) => (
        <ListItem
          key={pass.id}
          button
          selected={currentIndex === index}
          onClick={() => onSelect(index)}
        >
          <ListItemText primary={pass.username} secondary={pass.website} />
        </ListItem>
      ))}

      {!isLoading && (data ?? []).length === 0 && (
        <ListItem>
          <ListItemText
            primary="Empty"
            disableTypography
            sx={{ color: 'grey.500' }}
          />
        </ListItem>
      )}
    </List>
  );
}
