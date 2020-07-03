import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import IconMoreVert from '@material-ui/icons/MoreVert';

const StatusListItem = ({ status, defaultLanguage }) => (
  <ListItem>
    <ListItemText
      primary={status.locales[defaultLanguage].label}
      secondary={status.locales[defaultLanguage].description}
    />
    <ListItemSecondaryAction>
      <IconButton>
        <IconMoreVert />
      </IconButton>
    </ListItemSecondaryAction>
  </ListItem>
);

export default StatusListItem;
