import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';

const DeleteStatusDialog = ({
  deleteStatus,
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
        fallback_status_id: moveToStatus || '',
      });
    }
  };

  if (!deleteStatus || !open) return null;

  if (!deleteStatus.items_count) {
    return (
      <ConfirmProceedDialog
        open
        title={
          <FormattedMessage
            id="deleteStatusDialog.statusNotInUseTitle"
            defaultMessage="Confirm status deletion"
            description="Title displayed on a confirmation modal when a status being deleted is not in used by any item."
          />
        }
        body={
          <div>
            <Typography variant="body1" component="p" paragraph>
              <FormattedMessage
                id="deleteStatusDialog.statusNotInUseMessage"
                defaultMessage="Are you sure you want to delete this status?"
                description="Confirmation message displayed on a modal when a status is deleted from statuses settings page."
              />
            </Typography>
          </div>
        }
        onCancel={onCancel}
        onProceed={handleSubmit}
        proceedLabel={
          <FormattedMessage
            id="statusesComponent.deleteButton"
            defaultMessage="Delete status"
            description="Button label to delete status"
          />
        }
      />
    );
  }

  const inputLabel = (
    <FormattedMessage
      id="deleteStatusDialog.moveItemsTo"
      defaultMessage="Move items to"
      description="This is a field label. In this field, a destination status can be set, so, when a status is deleted, all existing items will be moved to this status defined here in this field."
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
          description="Title of a modal that is displayed when a status in use is being deleted."
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
              description="Message of a modal that is displayed when a status in use is being deleted."
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
                description="Message of a modal that is displayed when a status in use is being deleted."
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
          description="Label of a button that is displayed when a status in use is being deleted."
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
  statuses: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  }).isRequired).isRequired,
};

DeleteStatusDialog.defaultProps = {
  deleteStatus: {},
};

const DeleteStatusDialogContainer = originalProps => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query DeleteStatusDialogQuery($teamSlug: String!, $status: String!) {
        team(slug: $teamSlug) {
          id
          verification_statuses_with_counters: verification_statuses(items_count_for_status: $status, published_reports_count_for_status: $status)
        }
      }
    `}
    variables={{
      teamSlug: originalProps.teamSlug,
      status: originalProps.defaultValue,
    }}
    render={({ error, props }) => {
      if (!error && props) {
        const deleteStatus = props.team.verification_statuses_with_counters.statuses.find(s => s.id === originalProps.defaultValue);
        return <DeleteStatusDialog {...originalProps} deleteStatus={deleteStatus} />;
      }

      // TODO: We need a better error handling in the future, standardized with other components
      return null;
    }}
  />
);

export default DeleteStatusDialogContainer;
