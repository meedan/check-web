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
import { FormattedGlobalMessage } from '../../MappedMessage';
import { subheading2 } from '../../../styles/js/shared';

const StyledStatusLabel = styled.span`
  color: ${props => props.color};
  font: ${subheading2};
  font-weight: 500;
`;

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

  return (
    <ListItem>
      <ListItemText
        primary={
          isDefault ? (
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
export { StyledStatusLabel };
