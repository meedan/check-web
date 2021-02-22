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
import StatusLabel from './StatusLabel';
import StatusMessage from './StatusMessage';
import { FormattedGlobalMessage } from '../../MappedMessage';

const StatusListItem = ({
  defaultLanguage,
  isDefault,
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
    onDelete(status);
  };
  const handleEdit = () => {
    handleClose();
    onEdit(status);
  };
  const handleMakeDefault = () => {
    handleClose();
    onMakeDefault(status);
  };

  const localeStatus = status.locales[defaultLanguage];

  const statusLabel =
    localeStatus && localeStatus.label ? localeStatus.label : status.label;

  const statusDescription =
    localeStatus && localeStatus.description ? localeStatus.description : (
      <FormattedMessage
        id="statusListItem.noDescription"
        defaultMessage="No description"
      />
    );

  const statusMessage =
    localeStatus && localeStatus.message && status.should_send_message ?
      localeStatus.message : null;

  return (
    <ListItem className="status-list-item">
      <ListItemText
        primary={
          isDefault ? (
            <FormattedMessage
              id="statusListItem.default"
              defaultMessage="{statusLabel} (default)"
              values={{
                statusLabel: (
                  <StatusLabel color={status.style.color}>
                    {statusLabel}
                  </StatusLabel>
                ),
              }}
            />
          ) : (
            <StatusLabel color={status.style.color}>
              {statusLabel}
            </StatusLabel>
          )
        }
        secondary={
          <React.Fragment>
            <span>{statusDescription}</span><br />
            <StatusMessage message={statusMessage} />
          </React.Fragment>
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
          <MenuItem className="status-actions__make-default" onClick={handleMakeDefault} disabled={isDefault}>
            <FormattedMessage id="statusListItem.makeDefault" defaultMessage="Make default" />
          </MenuItem>
          <MenuItem className="status-actions__edit" onClick={handleEdit}>
            <FormattedGlobalMessage messageKey="edit" />
          </MenuItem>
          <MenuItem className="status-actions__delete" onClick={handleDelete} disabled={preventDelete || isDefault}>
            <FormattedGlobalMessage messageKey="delete" />
          </MenuItem>
        </Menu>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

StatusListItem.propTypes = {
  defaultLanguage: PropTypes.string.isRequired,
  isDefault: PropTypes.bool,
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
  isDefault: false,
  preventDelete: false,
};

export default StatusListItem;
