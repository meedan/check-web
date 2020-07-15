import React from 'react';
import PropTypes from 'prop-types';
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
        <IconButton className="status-actions__menu" onClick={e => setAnchorEl(e.target)}>
          <IconMoreVert />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem className="status-actions__make-default" onClick={handleMakeDefault} disabled={initialStatus}>
            <FormattedMessage id="statusListItem.makeDefault" defaultMessage="Make default" />
          </MenuItem>
          <MenuItem className="status-actions__edit" onClick={handleEdit}>
            <FormattedMessage {...globalStrings.edit} />
          </MenuItem>
          <MenuItem className="status-actions__delete" onClick={handleDelete} disabled={preventDelete || initialStatus}>
            <FormattedMessage {...globalStrings.delete} />
          </MenuItem>
        </Menu>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

StatusListItem.propTypes = {
  defaultLanguage: PropTypes.string.isRequired,
  initialStatus: PropTypes.bool,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onMakeDefault: PropTypes.func.isRequired,
  preventDelete: PropTypes.bool,
  status: PropTypes.shape({
    id: PropTypes.string.isRequired,
    locales: PropTypes.object.isRequired,
  }).isRequired,
};

StatusListItem.defaultProps = {
  initialStatus: false,
  preventDelete: false,
};

export default StatusListItem;
export { StyledStatusLabel };
