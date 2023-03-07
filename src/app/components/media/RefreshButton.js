import React from 'react';
import Relay from 'react-relay/classic';
import { graphql, commitMutation } from 'react-relay/compat';
import IconButton from '@material-ui/core/IconButton';
import RefreshIcon from '@material-ui/icons/Refresh';
import { textPrimary } from '../../styles/js/shared';

const submitRefresh = (projectMediaId) => {
  console.log('submit mutation', projectMediaId); // eslint-disable-line
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
    onCompleted: ({ response, error }) => {
      if (error) {
        // return onFailure(error);
        console.log('deu ruim', response, error); // eslint-disable-line
        console.log('response', response); // eslint-disable-line
        console.log('error', error); // eslint-disable-line
      }
      // return onSuccess(response);
    },
    onError: () => { console.log('deu ruim ii'); }, // eslint-disable-line
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
