import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import StatusLabel from './StatusLabel';
import StatusMessage from './StatusMessage';
import { FormattedGlobalMessage } from '../../MappedMessage';
import IconMoreVert from '../../../icons/more_vert.svg';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import settingsStyles from '../Settings.module.css';

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
        description="Empty state message if a status has no additional description"
      />
    );

  const statusMessage =
    localeStatus && localeStatus.message && status.should_send_message ?
      localeStatus.message : null;

  return (
    <li>
      <div>
        {isDefault ? (
          <FormattedMessage
            id="statusListItem.default"
            defaultMessage="{statusLabel}"
            description="The label of the user created status, with an additional note in parenthesis if the label is the default"
            values={{
              statusLabel: (
                <StatusLabel color={status.style.color}>
                  {statusLabel}
                  <small>
                    (default)
                  </small>
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
        <p>{statusDescription}</p>
        <StatusMessage message={statusMessage} />
      </div>
      <div className={settingsStyles['setting-content-list-actions']}>
        <ButtonMain className="status-actions__menu" iconCenter={<IconMoreVert />} variant="outlined" size="default" theme="text" onClick={e => setAnchorEl(e.target)} />
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem className="status-actions__make-default" onClick={handleMakeDefault} disabled={isDefault}>
            <FormattedMessage id="statusListItem.makeDefault" defaultMessage="Make default" description="Menu item choice for making the label the default choice" />
          </MenuItem>
          <MenuItem className="status-actions__edit" onClick={handleEdit}>
            <FormattedGlobalMessage messageKey="edit" />
          </MenuItem>
          <MenuItem className="status-actions__delete" onClick={handleDelete} disabled={preventDelete || isDefault}>
            <FormattedGlobalMessage messageKey="delete" />
          </MenuItem>
        </Menu>
      </div>
    </li>
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
