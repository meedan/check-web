import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { graphql, commitMutation } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import TranscribeIcon from '../../icons/transcribe.svg';
import { withSetFlashMessage } from '../FlashMessage';

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
    <ButtonMain
      buttonProps={{
        id: 'transcription-button__request-transcription',
      }}
      disabled={pending || (transcription && transcription.data && transcription.data.last_response.job_status)}
      iconLeft={<TranscribeIcon />}
      label={
        pending ?
          <FormattedMessage
            defaultMessage="Requesting Transcription…"
            description="Message displayed when transcription operation hasn't started yet"
            id="transcriptionButton.inProgress"
          />
          :
          <FormattedMessage
            defaultMessage="Transcribe Media"
            description="Button label - when this button is clicked, transcription operation starts"
            id="transcriptionButton.label"
          />
      }
      size="small"
      theme="text"
      variant="contained"
      onClick={handleClick}
    />
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
