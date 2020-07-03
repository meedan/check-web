import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import IconMoreVert from '@material-ui/icons/MoreVert';
import styled from 'styled-components';

import { subheading2 } from '../../../styles/js/shared';

const StyledStatusLabel = styled.span`
  color: ${props => props.color};
  font: ${subheading2};
  font-weight: 500;
`;

const StatusListItem = ({ status, defaultLanguage }) => (
  <ListItem>
    <ListItemText
      primary={
        <StyledStatusLabel color={status.style.color}>
          {status.locales[defaultLanguage].label}
        </StyledStatusLabel>
      }
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
export { StyledStatusLabel };
