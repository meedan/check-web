import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { graphql, commitMutation } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import { withSetFlashMessage } from '../FlashMessage';

const OcrButton = ({
  projectMediaId,
  projectMediaType,
  classes,
  hasExtractedText,
  setFlashMessage,
}) => {
  const [pending, setPending] = React.useState(false);

  const handleError = () => {
    setPending(false);
    setFlashMessage((
      <FormattedMessage
        id="ocrButton.defaultErrorMessage"
        defaultMessage="Could not extract text from image"
        description="Warning displayed if an error occurred when extracting text from image"
      />
    ), 'error');
  };

  const handleSuccess = () => {
    setPending(false);
    setFlashMessage((
      <FormattedMessage
        id="ocrButton.textExtractedSuccessfully"
        defaultMessage="Text extraction completed"
        description="Banner displayed when text extraction operation for an image is done"
      />
    ), 'success');
  };

  const handleClick = () => {
    setPending(true);
    commitMutation(Relay.Store, {
      mutation: graphql`
        mutation OcrButtonExtractTextMutation($input: ExtractTextInput!) {
          extractText(input: $input) {
            project_media {
              id
              extracted_text: annotation(annotation_type: "extracted_text") {
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

  if (projectMediaType !== 'UploadedImage' || hasExtractedText) {
    return null;
  }

  return (
    <Button
      size="small"
      classes={classes}
      onClick={handleClick}
      variant="outlined"
      disabled={pending}
    >
      { pending ?
        <FormattedMessage
          id="ocrButton.inProgress"
          defaultMessage="Text extraction in progress…"
          description="Message displayed while text is being extracted from an image"
        /> :
        <FormattedMessage
          id="ocrButton.label"
          defaultMessage="Extract text from image"
          description="Button label - when this button is clicked, text is extracted from image"
        /> }
    </Button>
  );
};

OcrButton.defaultProps = {
  classes: null,
  hasExtractedText: false,
};

OcrButton.propTypes = {
  projectMediaId: PropTypes.string.isRequired,
  projectMediaType: PropTypes.string.isRequired,
  classes: PropTypes.any,
  hasExtractedText: PropTypes.bool,
  setFlashMessage: PropTypes.func.isRequired,
};

export default withSetFlashMessage(OcrButton);
