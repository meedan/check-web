import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import IconMoreVert from '@material-ui/icons/MoreVert';

const StatusListItem = ({ status }) => (
  <ListItem>
    <ListItemText primary={status.label} secondary={status.description} />
    <ListItemSecondaryAction>
      <IconButton>
        <IconMoreVert />
      </IconButton>
    </ListItemSecondaryAction>
  </ListItem>
);

export default StatusListItem;
