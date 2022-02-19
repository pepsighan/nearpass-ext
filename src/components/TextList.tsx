import { List, ListItem, ListItemText } from '@mui/material';
import React from 'react';
import { useAllTexts } from '../store/text';

type TextListProps = {
  currentIndex: number;
  onSelect: (index: number) => void;
};

export default function TextList({ currentIndex, onSelect }: TextListProps) {
  const { data, isLoading } = useAllTexts();

  return (
    <List sx={{ minWidth: 200 }}>
      {(data ?? []).map((pass, index) => (
        <ListItem
          key={pass.id}
          button
          selected={currentIndex === index}
          onClick={() => onSelect(index)}
        >
          <ListItemText primary={pass.title} />
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
