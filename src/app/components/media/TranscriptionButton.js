import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { graphql, commitMutation } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import { withSetFlashMessage } from '../FlashMessage';

const TranscriptionButton = ({
  projectMediaId,
  projectMediaType,
  classes,
  transcription,
  setFlashMessage,
}) => {
  const [pending, setPending] = React.useState(false);

  const handleError = () => {
    setPending(false);
    setFlashMessage((
      <FormattedMessage
        id="transcriptionButton.defaultErrorMessage"
        defaultMessage="Could not get transcription"
        description="Warning displayed if an error occurred when transcribing an audio or video file"
      />
    ), 'error');
  };

  const handleSuccess = () => {
    setPending(false);
    setFlashMessage((
      <FormattedMessage
        id="transcriptionButton.textExtractedSuccessfully"
        defaultMessage="Transcription started, please come back in a few seconds to see it"
        description="Banner displayed when transcription operation starts"
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
  };

  if (projectMediaType !== 'UploadedAudio' && projectMediaType !== 'UploadedVideo') {
    return null;
  }

  return (
    <Button
      size="small"
      classes={classes}
      onClick={handleClick}
      variant="outlined"
      disabled={pending || (transcription && transcription.data && transcription.data.last_response.job_status)}
    >
      { pending ?
        <FormattedMessage
          id="transcriptionButton.inProgress"
          defaultMessage="Requesting transcription…"
          description="Message displayed when transcription operation hasn't started yet"
        /> :
        <FormattedMessage
          id="transcriptionButton.label"
          defaultMessage="Transcribe audio"
          description="Button label - when this button is clicked, transcription operation starts"
        /> }
    </Button>
  );
};

TranscriptionButton.defaultProps = {
  classes: null,
  transcription: null,
};

TranscriptionButton.propTypes = {
  projectMediaId: PropTypes.string.isRequired,
  projectMediaType: PropTypes.string.isRequired,
  classes: PropTypes.any,
  transcription: PropTypes.object,
  setFlashMessage: PropTypes.func.isRequired,
};

export default withSetFlashMessage(TranscriptionButton);
