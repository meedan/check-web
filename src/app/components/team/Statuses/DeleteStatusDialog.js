/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';

const DeleteStatusDialog = ({
  defaultValue: deleteStatus,
  onCancel,
  onProceed,
  open,
  statuses,
}) => {
  const [moveToStatus, setMoveToStatus] = React.useState(null);

  const handleSelect = (e) => {
    setMoveToStatus(e.target.value);
  };

  const handleSubmit = () => {
    if (onProceed) {
      onProceed({
        status_id: deleteStatus.id,
        fallback_status_id: moveToStatus,
      });
    }
  };

  if (!deleteStatus || !open) return null;

  const inputLabel = (
    <FormattedMessage
      id="deleteStatusDialog.moveItemsTo"
      defaultMessage="Move items to"
    />
  );

  return (
    <ConfirmProceedDialog
      open={open}
      title={
        <FormattedMessage
          id="deleteStatusDialog.statusInUseTitle"
          defaultMessage="{itemsCount, plural, one {You need to change the status of one item to delete this status} other {You need to change the status of # items to delete this status}}"
          values={{ itemsCount: deleteStatus.items_count }}
        />
      }
      body={
        <div>
          <Typography variant="body1" component="p" paragraph>
            <FormattedMessage
              id="deleteStatusDialog.statusInUseMessage"
              defaultMessage="{itemsCount, plural, one {There is one item with the status {statusLabel} that must be changed to another status before you can delete this status.} other {There are # items with the status {statusLabel} that must be changed to another status before you can delete this status.}}"
              values={{
                itemsCount: deleteStatus.items_count,
                statusLabel: <strong>{deleteStatus.label}</strong>,
              }}
            />
          </Typography>
          { deleteStatus.published_reports_count ?
            <Typography variant="body1" component="p" paragraph>
              <FormattedMessage
                id="deleteStatusDialog.itemsPublishedMessage"
                defaultMessage="{publishedCount, plural, one {There  is one item currently published with the status {statusLabel}. If you continue, all published items with this status will be paused. You must review those items to re-publish them.} other {There are # items currently published with the status {statusLabel}. If you continue, all published items with this status will be paused. You must review those items to re-publish them.}}"
                values={{
                  publishedCount: deleteStatus.published_reports_count,
                  statusLabel: <strong>{deleteStatus.label}</strong>,
                }}
              />
            </Typography>
            : null
          }
          <div>
            <FormControl variant="outlined" fullWidth>
              <InputLabel id="delete-status-dialog__select">
                {inputLabel}
              </InputLabel>
              <Select
                id="delete-status-dialog__select"
                defaultValue=""
                label={inputLabel}
                onChange={handleSelect}
              >
                { statuses
                  .filter(s => s.id !== deleteStatus.id)
                  .map(s => (
                    <MenuItem
                      className={`delete-status-dialog__select-item-${s.id}`}
                      key={s.id}
                      value={s.id}
                    >
                      {s.label}
                    </MenuItem>
                  ))
                }
              </Select>
            </FormControl>
          </div>
        </div>
      }
      onCancel={onCancel}
      onProceed={handleSubmit}
      proceedDisabled={!moveToStatus}
      proceedLabel={
        <FormattedMessage
          id="statusesComponent.moveItemsAndDelete"
          defaultMessage="Move items and delete status"
        />
      }
    />
  );
};

DeleteStatusDialog.propTypes = {
  defaultValue: PropTypes.object,
  onCancel: PropTypes.func.isRequired,
  onProceed: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  statuses: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  }).isRequired).isRequired,
};

DeleteStatusDialog.defaultProps = {
  defaultValue: {},
};

export default DeleteStatusDialog;
