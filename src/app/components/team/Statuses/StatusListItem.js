import React from 'react';
import { FormattedMessage } from 'react-intl';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconMoreVert from '@material-ui/icons/MoreVert';
import styled from 'styled-components';
import globalStrings from '../../../globalStrings';
import { subheading2 } from '../../../styles/js/shared';

const StyledStatusLabel = styled.span`
  color: ${props => props.color};
  font: ${subheading2};
  font-weight: 500;
`;

const StatusListItem = ({
  defaultLanguage,
  onDelete,
  onEdit,
  status,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClose = () => setAnchorEl(null);
  const handleEdit = () => {
    handleClose();
    if (onEdit) {
      onEdit();
    }
  };

  return (
    <ListItem>
      <ListItemText
        primary={
          <StyledStatusLabel color={status.style.color}>
            {status.locales[defaultLanguage].label}
          </StyledStatusLabel>
        }
        secondary={
          status.locales[defaultLanguage].description ||
          <FormattedMessage
            id="statusListItem.noDescription"
            defaultMessage="No description"
          />
        }
      />
      <ListItemSecondaryAction>
        <IconButton onClick={e => setAnchorEl(e.target)}>
          <IconMoreVert />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={handleEdit}>
            <FormattedMessage {...globalStrings.edit} />
          </MenuItem>
          <MenuItem onClick={onDelete}>
            <FormattedMessage {...globalStrings.delete} />
          </MenuItem>
        </Menu>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default StatusListItem;
export { StyledStatusLabel };
