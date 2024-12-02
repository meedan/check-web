import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { graphql, commitMutation } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import TranscribeIcon from '../../icons/transcribe.svg';
import { withSetFlashMessage } from '../FlashMessage';
import styles from './media.module.css';

const TranscriptionButton = ({
  onClick,
  projectMediaId,
  projectMediaType,
  setFlashMessage,
  transcription,
}) => {
  const [pending, setPending] = React.useState(false);

  const handleError = () => {
    setPending(false);
    setFlashMessage((
      <FormattedMessage
        defaultMessage="Could not get transcription"
        description="Warning displayed if an error occurred when transcribing an audio or video file"
        id="transcriptionButton.defaultErrorMessage"
      />
    ), 'error');
  };

  const handleSuccess = () => {
    setPending(false);
    setFlashMessage((
      <FormattedMessage
        defaultMessage="Transcription started, please come back in a few seconds to see it"
        description="Banner displayed when transcription operation starts"
        id="transcriptionButton.textExtractedSuccessfully"
      />
    ), 'success');
  };

  const handleClick = () => {
    setPending(true);
    commitMutation(Relay.Store, {
      mutation: graphql`
        mutation TranscriptionButtonTranscribeAudioMutation($input: TranscribeAudioInput!) {
          transcribeAudio(input: $input) {
            project_media {
              id
              transcription: annotation(annotation_type: "transcription") {
                data
              }
            }
          }
        }
      `,
      variables: {
        input: {
          id: projectMediaId,
        },
      },
      onCompleted: (response, error) => {
        if (error) {
          handleError();
        } else {
          handleSuccess();
        }
      },
      onError: () => {
        handleError();
      },
    });
    onClick();
  };

  if (projectMediaType !== 'UploadedAudio' && projectMediaType !== 'UploadedVideo') {
    return null;
  }

  return (
    <MenuItem
      className={styles.mediaMenuItem}
      disabled={pending || (transcription && transcription.data && transcription.data.last_response.job_status)}
      id="transcription-button__request-transcription"
      onClick={handleClick}
    >
      { pending ?
        <FormattedMessage
          defaultMessage="Requesting transcription…"
          description="Message displayed when transcription operation hasn't started yet"
          id="transcriptionButton.inProgress"
        /> :
        <>
          <ListItemIcon className={styles.mediaMenuIcon}>
            <TranscribeIcon />
          </ListItemIcon>
          <ListItemText
            primary={
              <FormattedMessage
                defaultMessage="Transcribe this Media"
                description="Button label - when this button is clicked, transcription operation starts"
                id="transcriptionButton.label"
              />
            }
          />
        </>
      }
    </MenuItem>
  );
};

TranscriptionButton.defaultProps = {
  transcription: null,
};

TranscriptionButton.propTypes = {
  projectMediaId: PropTypes.string.isRequired,
  projectMediaType: PropTypes.string.isRequired,
  setFlashMessage: PropTypes.func.isRequired,
  transcription: PropTypes.object,
  onClick: PropTypes.func.isRequired,
};

export default withSetFlashMessage(TranscriptionButton);
