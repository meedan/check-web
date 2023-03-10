import React from 'react';
import Relay from 'react-relay/classic';
import { graphql, commitMutation } from 'react-relay/compat';
import IconButton from '@material-ui/core/IconButton';
import RefreshIcon from '@material-ui/icons/Refresh';
import { textPrimary } from '../../styles/js/shared';

const submitRefresh = (projectMediaId) => {
  commitMutation(Relay.Store, {
    mutation: graphql`
      mutation RefreshButtonUpdateProjectMediaMutation($input: UpdateProjectMediaInput!) {
        updateProjectMedia(input: $input) {
          project_media {
            media {
              metadata,
              url,
              embed_path,
              thumbnail_path
            }
          }
        }
      }
    `,
    variables: {
      input: {
        refresh_media: 1,
        id: projectMediaId,
      },
    },
    onCompleted: ({ error }) => {
      if (error) {
        // TODO return onFailure(error);
      }
      // TODO return onSuccess(response);
    },
    onError: () => {}, // TODO
  });
};

const RefreshButton = ({ projectMediaId }) => (
  <IconButton
    onClick={() => submitRefresh(projectMediaId)}
    style={{ color: textPrimary }}
  >
    <RefreshIcon />
  </IconButton>
);

export default RefreshButton;
