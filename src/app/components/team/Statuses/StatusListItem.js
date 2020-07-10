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
  initialStatus,
  onDelete,
  onEdit,
  onMakeDefault,
  preventDelete,
  status,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClose = () => setAnchorEl(null);
  const handleDelete = () => {
    handleClose();
    if (onDelete) onDelete(status);
  };
  const handleEdit = () => {
    handleClose();
    if (onEdit) onEdit(status); // TODO default props to avoid checking?
  };
  const handleMakeDefault = () => {
    handleClose();
    if (onMakeDefault) onMakeDefault(status); // TODO default props to avoid checking?
  };

  return (
    <ListItem>
      <ListItemText
        primary={
          initialStatus ? (
            <FormattedMessage
              id="statusListItem.default"
              defaultMessage="{statusLabel} (default)"
              values={{
                statusLabel: (
                  <StyledStatusLabel color={status.style.color}>
                    {status.locales[defaultLanguage].label}
                  </StyledStatusLabel>
                ),
              }}
            />
          ) : (
            <StyledStatusLabel color={status.style.color}>
              {status.locales[defaultLanguage].label}
            </StyledStatusLabel>
          )
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
          <MenuItem onClick={handleMakeDefault} disabled={initialStatus}>
            <FormattedMessage id="statusListItem.makeDefault" defaultMessage="Make default" />
          </MenuItem>
          <MenuItem onClick={handleEdit}>
            <FormattedMessage {...globalStrings.edit} />
          </MenuItem>
          <MenuItem onClick={handleDelete} disabled={preventDelete || initialStatus}>
            <FormattedMessage {...globalStrings.delete} />
          </MenuItem>
        </Menu>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default StatusListItem;
export { StyledStatusLabel };
