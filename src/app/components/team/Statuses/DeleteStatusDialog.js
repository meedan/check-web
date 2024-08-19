/* eslint-disable react/sort-prop-types */
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Select from '../../cds/inputs/Select';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';

/* Exported for unit test */
/* eslint-disable-next-line import/no-unused-modules */
export const DeleteStatusDialog = ({
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
        body={
          <FormattedMessage
            defaultMessage="Are you sure you want to delete this status?"
            description="Confirmation message displayed on a modal when a status is deleted from statuses settings page."
            id="deleteStatusDialog.statusNotInUseMessage"
            tagName="p"
          />
        }
        open
        proceedLabel={
          <FormattedMessage
            defaultMessage="Delete status"
            description="Button label to delete status"
            id="statusesComponent.deleteButton"
          />
        }
        title={
          <FormattedMessage
            defaultMessage="Confirm status deletion"
            description="Title displayed on a confirmation modal when a status being deleted is not in used by any item."
            id="deleteStatusDialog.statusNotInUseTitle"
          />
        }
        onCancel={onCancel}
        onProceed={handleSubmit}
      />
    );
  }

  const inputLabel = (
    <FormattedMessage
      defaultMessage="Move items to"
      description="This is a field label. In this field, a destination status can be set, so, when a status is deleted, all existing items will be moved to this status defined here in this field."
      id="deleteStatusDialog.moveItemsTo"
    />
  );

  return (
    <ConfirmProceedDialog
      body={
        <div>
          <FormattedMessage
            defaultMessage="{itemsCount, plural, one {There is one item with the status {statusLabel} that must be changed to another status before you can delete this status.} other {There are # items with the status {statusLabel} that must be changed to another status before you can delete this status.}}"
            description="Message of a modal that is displayed when a status in use is being deleted."
            id="deleteStatusDialog.statusInUseMessage"
            tagName="p"
            values={{
              itemsCount: deleteStatus.items_count,
              statusLabel: <strong>{deleteStatus.label}</strong>,
            }}
          />
          { deleteStatus.published_reports_count ?
            <FormattedMessage
              defaultMessage="{publishedCount, plural, one {There  is one item currently published with the status {statusLabel}. If you continue, all published items with this status will be paused. You must review those items to re-publish them.} other {There are # items currently published with the status {statusLabel}. If you continue, all published items with this status will be paused. You must review those items to re-publish them.}}"
              description="Message of a modal that is displayed when a status in use is being deleted."
              id="deleteStatusDialog.itemsPublishedMessage"
              tagName="p"
              values={{
                publishedCount: deleteStatus.published_reports_count,
                statusLabel: <strong>{deleteStatus.label}</strong>,
              }}
            /> : null
          }
          <div>
            <Select
              defaultValue=""
              id="delete-status-dialog__select"
              label={inputLabel}
              onChange={handleSelect}
            >
              <FormattedMessage defaultMessage="Select status…" description="This is a field placeholder. In this field, a destination status can be set, so, when a status is deleted, all existing items will be moved to this status defined here in this field." id="deleteStatusDialog.moveItemsToPlaceholder" >
                { placeholder => (
                  <option hidden>
                    {placeholder}
                  </option>
                )}
              </FormattedMessage>
              { statuses
                .filter(s => s.id !== deleteStatus.id)
                .map(s => (
                  <option
                    className={`delete-status-dialog__select-item-${s.id}`}
                    key={s.id}
                    value={s.id}
                  >
                    {s.label}
                  </option>
                ))
              }
            </Select>
          </div>
        </div>
      }
      open={open}
      proceedDisabled={!moveToStatus}
      proceedLabel={
        <FormattedMessage
          defaultMessage="Move items and delete status"
          description="Label of a button that is displayed when a status in use is being deleted."
          id="statusesComponent.moveItemsAndDelete"
        />
      }
      title={
        <FormattedMessage
          defaultMessage="{itemsCount, plural, one {You need to change the status of one item to delete this status} other {You need to change the status of # items to delete this status}}"
          description="Title of a modal that is displayed when a status in use is being deleted."
          id="deleteStatusDialog.statusInUseTitle"
          values={{ itemsCount: deleteStatus.items_count }}
        />
      }
      onCancel={onCancel}
      onProceed={handleSubmit}
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
    render={({ error, props }) => {
      if (!error && props) {
        const deleteStatus = props.team.verification_statuses_with_counters.statuses.find(s => s.id === originalProps.defaultValue);
        return <DeleteStatusDialog {...originalProps} deleteStatus={deleteStatus} />;
      }

      // TODO: We need a better error handling in the future, standardized with other components
      return null;
    }}
    variables={{
      teamSlug: originalProps.teamSlug,
      status: originalProps.defaultValue,
    }}
  />
);

export default DeleteStatusDialogContainer;
