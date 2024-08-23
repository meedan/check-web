/* eslint-disable relay/unused-fields, react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { commitMutation, createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import TextField from '../cds/inputs/TextField';
import MultiSelector from '../layout/MultiSelector';
import { withSetFlashMessage } from '../FlashMessage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import { getErrorMessageForRelayModernProblem } from '../../helpers';

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
          defaultMessage="Items assigned successfully"
          description="Success message for bulk assignment action"
          id="bulkActionsAssign.success"
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
    <FormattedMessage defaultMessage="Search…" description="Placeholder text for searching tags" id="tagMenu.search">
      {placeholder => (
        <MultiSelector
          allowSearch
          cancelLabel={<FormattedMessage defaultMessage="Cancel" description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation" id="global.cancel" />}
          inputPlaceholder={placeholder}
          notFoundLabel={
            <FormattedMessage
              defaultMessage="No members found"
              description="Displayed when no member names match search input"
              id="bulkActionsAssign.notFound"
            />
          }
          options={options}
          selected={[]}
          submitLabel={
            <FormattedMessage
              defaultMessage="{numItems, plural, one {Assign # item} other {Assign # items}}"
              description="Button for commiting the action of assigning of a number of items in bulk"
              id="bulkActionsAssign.submitLabel"
              values={{ numItems: selectedMedia.length }}
            />
          }
          onSubmit={handleSubmit}
        >
          <Box mt={2} mx={2}>
            <TextField
              label={
                <FormattedMessage
                  defaultMessage="Add a note to email notification"
                  description="Field for adding complementary information for the assignee"
                  id="bulkActionsAssign.assignmentNotes"
                />
              }
              multiline
              rows={4}
              variant="outlined"
              onChange={e => setAssignMessage(e.target.value)}
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
