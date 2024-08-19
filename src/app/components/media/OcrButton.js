/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { graphql, commitMutation } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import MenuItem from '@material-ui/core/MenuItem';
import { withSetFlashMessage } from '../FlashMessage';

const OcrButton = ({
  hasExtractedText,
  onClick,
  projectMediaId,
  projectMediaType,
  setFlashMessage,
}) => {
  const [pending, setPending] = React.useState(false);

  const handleError = () => {
    setPending(false);
    setFlashMessage((
      <FormattedMessage
        defaultMessage="Could not extract text from image"
        description="Warning displayed if an error occurred when extracting text from image"
        id="ocrButton.defaultErrorMessage"
      />
    ), 'error');
  };

  const handleSuccess = () => {
    setPending(false);
    setFlashMessage((
      <FormattedMessage
        defaultMessage="Text extraction completed"
        description="Banner displayed when text extraction operation for an image is done"
        id="ocrButton.textExtractedSuccessfully"
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
    onClick();
  };

  if (projectMediaType !== 'UploadedImage' || hasExtractedText) {
    return null;
  }

  return (
    <MenuItem
      disabled={pending}
      id="ocr-button__extract-text"
      onClick={handleClick}
    >
      { pending ?
        <FormattedMessage
          defaultMessage="Text extraction in progress…"
          description="Message displayed while text is being extracted from an image"
          id="ocrButton.inProgress"
        /> :
        <FormattedMessage
          defaultMessage="Extract text"
          description="Button label - when this button is clicked, text is extracted from image"
          id="ocrButton.label"
        /> }
    </MenuItem>
  );
};

OcrButton.defaultProps = {
  hasExtractedText: false,
};

OcrButton.propTypes = {
  projectMediaId: PropTypes.string.isRequired,
  projectMediaType: PropTypes.string.isRequired,
  hasExtractedText: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  setFlashMessage: PropTypes.func.isRequired,
};

export default withSetFlashMessage(OcrButton);
