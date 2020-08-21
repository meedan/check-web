import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { commitMutation, graphql } from 'react-relay/compat';
import Box from '@material-ui/core/Box';
import Reorder from '../layout/Reorder';

function submitMoveTaskUp({
  fieldset,
  task,
  onFailure,
}) {
  commitMutation(Relay.Store, {
    mutation: graphql`
      mutation ReorderTaskMoveTaskUpMutation($input: MoveTaskUpInput!, $fieldset: String!) {
        moveTaskUp(input: $input) {
          project_media {
            tasks(fieldset: $fieldset, first: 10000) {
              edges {
                node {
                  id
                  order
                }
              }
            }
          }
        }
      }
    `,
    variables: {
      input: {
        id: task.id,
      },
      fieldset,
    },
    onError: onFailure,
    onCompleted: ({ errors }) => {
      if (errors) {
        return onFailure(errors);
      }
      return null;
    },
  });
}

function submitMoveTaskDown({
  fieldset,
  task,
  onFailure,
}) {
  commitMutation(Relay.Store, {
    mutation: graphql`
      mutation ReorderTaskMoveTaskDownMutation($input: MoveTaskDownInput!, $fieldset: String!) {
        moveTaskDown(input: $input) {
          project_media {
            tasks(fieldset: $fieldset, first: 10000) {
              edges {
                node {
                  id
                  order
                }
              }
            }
          }
        }
      }
    `,
    variables: {
      input: {
        id: task.id,
      },
      fieldset,
    },
    onError: onFailure,
    onCompleted: ({ errors }) => {
      if (errors) {
        return onFailure(errors);
      }
      return null;
    },
  });
}

const ReorderTask = ({
  children,
  fieldset,
  task,
}) => {
  const onFailure = () => {};

  const handleMoveTaskUp = () => {
    submitMoveTaskUp({
      fieldset,
      task,
      onFailure,
    });
  };

  const handleMoveTaskDown = () => {
    submitMoveTaskDown({
      fieldset,
      task,
      onFailure,
    });
  };

  return (
    <Box display="flex" alignItems="center">
      <Reorder onMoveUp={handleMoveTaskUp} onMoveDown={handleMoveTaskDown} />
      {children}
    </Box>
  );
};

ReorderTask.propTypes = {
  children: PropTypes.node.isRequired,
  fieldset: PropTypes.string.isRequired,
  task: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
};

export default ReorderTask;
