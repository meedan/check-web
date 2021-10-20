import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { commitMutation, createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import { MultiSelector } from '@meedan/check-ui';
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
      setFlashMessage((
        <FormattedMessage
          id="bulkActionsStatus.success"
          defaultMessage="Item statuses changed successfully"
          description="Success message for bulk status change action"
        />
      ), 'success');

      const published = selectedProjectMedia.filter(pm => pm.report_status === 'published');
      setPublishedCount(published.length);
      onDismiss();
    };

    commitMutation(Relay.Store, {
      mutation: graphql`
        mutation BulkActionsStatusMutation($input: UpdateProjectMediasInput!) {
          updateProjectMedias(input: $input) {
            ids
            check_search_team {
              medias(first: 50) {
                edges {
                  node {
                    id
                    list_columns_values
                  }
                }
              }
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
      onCompleted: ({ response, error }) => {
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
      <FormattedMessage id="tagMenu.search" defaultMessage="Search…">
        {placeholder => (
          <MultiSelector
            allowSearch
            inputPlaceholder={placeholder}
            selected={[]}
            single
            options={options}
            onSubmit={handleSubmit}
            notFoundLabel={
              <FormattedMessage
                id="tagMenu.notFound"
                defaultMessage="No status found"
              />
            }
            submitLabel={
              <FormattedMessage
                id="bulkActionsStatus.submitLabel"
                defaultMessage="{numItems, plural, one {Set status of 1 item} other {Set status of # items}}"
                values={{ numItems: selectedMedia.length }}
                description="Button for commiting the action of setting status of a number of items in bulk"
              />
            }
          />
        )}
      </FormattedMessage>
      <ConfirmProceedDialog
        open={Boolean(publishedCount)}
        title={
          <FormattedMessage
            id="bulkActionsStatus.dialogTitle"
            defaultMessage="Some statuses could not be changed"
            description="Title of dialog warning after bulk updating item statuses"
          />
        }
        body={
          <Typography variant="body1" component="p" paragraph>
            <FormattedMessage
              id="bulkActionsStatus.dialogBody"
              defaultMessage="{publishedCount, plural, one {The status of 1 item could not be changed because its report is currently published. Please edit it individually.} other {The status of # items could not be changed because their reports are currently published. Please edit them individually.}}"
              values={{ publishedCount }}
              description="Body of dialog warning that bulk updating item statuses could not be performed entirely"
            />
          </Typography>
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
