/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { commitMutation, createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import MultiSelector from '../layout/MultiSelector';
import ConfirmProceedDialog from '../layout/ConfirmProceedDialog';
import { withSetFlashMessage } from '../FlashMessage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import { getErrorMessageForRelayModernProblem } from '../../helpers';

const BulkActionsStatus = ({
  onDismiss,
  selectedMedia,
  selectedProjectMedia,
  setFlashMessage,
  team,
}) => {
  const [publishedCount, setPublishedCount] = React.useState(0);
  const options = team.verification_statuses.statuses.map(st => ({ label: st.label, value: st.id, color: st.style?.color }));

  const handleSubmit = (value) => {
    const onFailure = (error) => {
      const errorMessage = getErrorMessageForRelayModernProblem(error) || <GenericUnknownErrorMessage />;
      setFlashMessage(errorMessage, 'error');
      onDismiss();
    };
    const onSuccess = () => {
      const published = selectedProjectMedia.filter(pm => pm.report_status === 'published');
      setPublishedCount(published.length);

      if (published.length === 0) {
        onDismiss();
        setFlashMessage((
          <FormattedMessage
            defaultMessage="Item statuses changed successfully"
            description="Success message for bulk status change action"
            id="bulkActionsStatus.success"
          />
        ), 'success');
      }
    };

    commitMutation(Relay.Store, {
      mutation: graphql`
        mutation BulkActionsStatusMutation($input: UpdateProjectMediasInput!) {
          updateProjectMedias(input: $input) {
            updated_objects {
              id
              status
              last_status
            }
          }
        }
      `,
      variables: {
        input: {
          ids: selectedMedia,
          action: 'update_status',
          params: JSON.stringify({
            status: value,
          }),
        },
      },
      onCompleted: ({ error, response }) => {
        if (error) {
          return onFailure(error);
        }
        return onSuccess(response);
      },
      onError: onFailure,
    });
  };

  return (
    <React.Fragment>
      <FormattedMessage defaultMessage="Search…" description="Placeholder for search input" id="tagMenu.search">
        {placeholder => (
          <MultiSelector
            allowSearch
            inputPlaceholder={placeholder}
            notFoundLabel={
              <FormattedMessage
                defaultMessage="No status found"
                description="Empty message when no statuses are returned"
                id="tagMenu.notFound"
              />
            }
            options={options}
            selected={[]}
            single
            submitLabel={
              <FormattedMessage
                defaultMessage="{numItems, plural, one {Set status of 1 item} other {Set status of # items}}"
                description="Button for commiting the action of setting status of a number of items in bulk"
                id="bulkActionsStatus.submitLabel"
                values={{ numItems: selectedMedia.length }}
              />
            }
            onSubmit={handleSubmit}
          />
        )}
      </FormattedMessage>
      <ConfirmProceedDialog
        body={
          <FormattedMessage
            defaultMessage="{publishedCount, plural, one {The status of 1 item could not be changed because its report is currently published. Please edit it individually.} other {The status of # items could not be changed because their reports are currently published. Please edit them individually.}}"
            description="Body of dialog warning that bulk updating item statuses could not be performed entirely"
            id="bulkActionsStatus.dialogBody"
            tagName="p"
            values={{ publishedCount }}
          />
        }
        open={Boolean(publishedCount)}
        title={
          <FormattedMessage
            defaultMessage="Some statuses could not be changed"
            description="Title of dialog warning after bulk updating item statuses"
            id="bulkActionsStatus.dialogTitle"
          />
        }
        onProceed={onDismiss}
      />
    </React.Fragment>
  );
};

BulkActionsStatus.propTypes = {
  onDismiss: PropTypes.func.isRequired,
  selectedMedia: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  setFlashMessage: PropTypes.func.isRequired,
  team: PropTypes.shape({
    verification_statuses: PropTypes.object.isRequired,
  }).isRequired,
};

export default createFragmentContainer(withSetFlashMessage(BulkActionsStatus), graphql`
  fragment BulkActionsStatus_team on Team {
    verification_statuses
  }
`);
