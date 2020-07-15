import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';

const DeleteStatusDialog = ({
  deleteStatus,
  onCancel,
  onProceed,
  open,
  statuses,
}) => {
  const [moveToStatus, setMoveToStatus] = React.useState(0);

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

  return (
    <ConfirmProceedDialog
      open={open}
      title={
        <FormattedMessage
          id="deleteStatusDialog.statusInUseTitle"
          defaultMessage="You need change the status of {items_count} items to delete this status"
          values={{ items_count: deleteStatus.items_count }}
        />
      }
      body={
        <React.Fragment>
          <p>
            <FormattedMessage
              id="deleteStatusDialog.statusInUseMessage"
              defaultMessage="There are {items_count} items with the status {statusName} that must be moved in order to delete this status, or you can go to each item and edit them individually."
              values={{ items_count: deleteStatus.items_count, statusName: deleteStatus.label }}
            />
          </p>
          <p>
            <FormattedMessage
              id="deleteStatusDialog.itemsPublishedMessage"
              defaultMessage="{published_count} of those items are currently published. Upon moving them to another status, the reports will be paused. Please review those items to re-publish them."
              values={{ published_count: deleteStatus.published_reports_count }}
            />
          </p>
          <div>
            <FormControl variant="outlined" fullWidth>
              <Select
                id="delete-status-dialog__select"
                value={moveToStatus}
                onChange={handleSelect}
              >
                <MenuItem className="delete-status-dialog__select-item-none" value={0}>
                  <FormattedMessage
                    id="deleteStatusDialog.moveItemsTo"
                    defaultMessage="Move items to"
                  />
                </MenuItem>
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
        </React.Fragment>
      }
      onCancel={onCancel}
      onProceed={handleSubmit}
      proceedDisabled={moveToStatus === 0}
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
  deleteStatus: PropTypes.object,
  onCancel: PropTypes.func.isRequired,
  onProceed: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  statuses: PropTypes.array.isRequired,
};

DeleteStatusDialog.defaultProps = {
  deleteStatus: null,
};

export default DeleteStatusDialog;
