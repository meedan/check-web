import React from 'react';
import Relay from 'react-relay/classic';
import { graphql, commitMutation } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import RefreshIcon from '../../icons/refresh.svg';
import { withSetFlashMessage } from '../FlashMessage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';

const submitRefresh = (projectMediaId, onSuccess, onFailure) => {
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
        onFailure();
      } else {
        onSuccess();
      }
    },
    onError: onFailure,
  });
};

const RefreshButton = ({ projectMediaId, setFlashMessage }) => {
  const [waitRequest, setWaitRequest] = React.useState(false);

  const onSuccess = () => {
    setWaitRequest(false);
    setFlashMessage((
      <FormattedMessage
        defaultMessage="Media refreshed successfully"
        description="Notification displayed when refresh action (re-parsing) of media is completed"
        id="refreshButton.success"
      />
    ), 'success');
  };
  const onFailure = () => {
    setWaitRequest(false);
    setFlashMessage(<GenericUnknownErrorMessage />, 'error');
  };

  const handleClick = () => {
    setWaitRequest(true);
    submitRefresh(projectMediaId, onSuccess, onFailure);
  };

  return (
    <ButtonMain
      className="media-actions__refresh"
      customStyle={{ color: waitRequest ? null : 'var(--color-gray-15)' }}
      disabled={waitRequest}
      iconCenter={<RefreshIcon />}
      size="small"
      theme="text"
      variant="outlined"
      onClick={handleClick} // For integration test
    />
  );
};

export default withSetFlashMessage(RefreshButton);
