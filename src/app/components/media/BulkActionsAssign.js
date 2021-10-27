import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { commitMutation, createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import { MultiSelector } from '@meedan/check-ui';
import { withSetFlashMessage } from '../FlashMessage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import { getErrorMessageForRelayModernProblem } from '../../helpers';
import globalStrings from '../../globalStrings';

const BulkActionsAssign = ({
  onDismiss,
  selectedMedia,
  setFlashMessage,
  team,
}) => {
  const [assignMessage, setAssignMessage] = React.useState('');

  const options = [];
  team.team_users.edges.forEach((teamUser) => {
    if (teamUser.node.status === 'member' && !teamUser.node.user.is_bot) {
      const { user } = teamUser.node;
      options.push({ label: user.name, value: user.dbid.toString() });
    }
  });
  const handleSubmit = (value) => {
    const onFailure = (error) => {
      const errorMessage = getErrorMessageForRelayModernProblem(error) || <GenericUnknownErrorMessage />;
      setFlashMessage(errorMessage, 'error');
      onDismiss();
    };
    const onSuccess = () => {
      setFlashMessage((
        <FormattedMessage
          id="bulkActionsAssign.success"
          defaultMessage="Items assigned successfully"
          description="Success message for bulk assignment action"
        />
      ), 'success');
      onDismiss();
    };

    commitMutation(Relay.Store, {
      mutation: graphql`
        mutation BulkActionsAssignMutation($input: UpdateProjectMediasInput!) {
          updateProjectMedias(input: $input) {
            ids
          }
        }
      `,
      variables: {
        input: {
          ids: selectedMedia,
          action: 'assigned_to_ids',
          params: JSON.stringify({
            assignment_message: assignMessage,
            assigned_to_ids: value.join(','),
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
    <FormattedMessage id="tagMenu.search" defaultMessage="Search…">
      {placeholder => (
        <MultiSelector
          allowSearch
          inputPlaceholder={placeholder}
          selected={[]}
          options={options}
          onSubmit={handleSubmit}
          cancelLabel={<FormattedMessage {...globalStrings.cancel} />}
          notFoundLabel={
            <FormattedMessage
              id="bulkActionsAssign.notFound"
              defaultMessage="No members found"
              description="Displayed when no member names match search input"
            />
          }
          submitLabel={
            <FormattedMessage
              id="bulkActionsAssign.submitLabel"
              defaultMessage="{numItems, plural, one {Assign 1 item} other {Assign # items}}"
              values={{ numItems: selectedMedia.length }}
              description="Button for commiting the action of assigning of a number of items in bulk"
            />
          }
        >
          <Box mx={2} mt={2}>
            <TextField
              label={
                <FormattedMessage
                  id="bulkActionsAssign.assignmentNotes"
                  defaultMessage="Add a note to email notification"
                  description="Field for adding complementary information for the assignee"
                />
              }
              onChange={e => setAssignMessage(e.target.value)}
              variant="outlined"
              rows={4}
              multiline
              fullWidth
            />
          </Box>
        </MultiSelector>
      )}
    </FormattedMessage>
  );
};

BulkActionsAssign.propTypes = {
  onDismiss: PropTypes.func.isRequired,
  selectedMedia: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  setFlashMessage: PropTypes.func.isRequired,
  team: PropTypes.shape({
    team_users: PropTypes.object.isRequired,
  }).isRequired,
};

export default createFragmentContainer(withSetFlashMessage(BulkActionsAssign), graphql`
  fragment BulkActionsAssign_team on Team {
    team_users(first: 10000) {
      edges {
        node {
          id
          status
          user {
            id
            dbid
            name
            is_bot
          }
        }
      }
    }
  }
`);
