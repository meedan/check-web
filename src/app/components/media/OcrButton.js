import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { graphql, commitMutation } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import DescriptionIcon from '../../icons/description.svg';
import { withSetFlashMessage } from '../FlashMessage';
import CheckMediaTypes from '../../constants/CheckMediaTypes';

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

  if (projectMediaType !== CheckMediaTypes.UPLOADEDAUDIO || hasExtractedText) {
    return null;
  }

  return (
    <ButtonMain
      buttonProps={{
        id: 'ocr-button__extract-text',
      }}
      iconLeft={<DescriptionIcon />}
      label={
        pending ?
          <FormattedMessage
            defaultMessage="Text extraction in progress…"
            description="Message displayed while text is being extracted from an image"
            id="ocrButton.inProgress"
          />
          :
          <FormattedMessage
            defaultMessage="Extract Text from Media"
            description="Button label - when this button is clicked, text is extracted from image"
            id="ocrButton.label"
          />
      }
      size="small"
      theme="text"
      variant="contained"
      onClick={handleClick}
    />
  );
};

OcrButton.defaultProps = {
  hasExtractedText: false,
};

OcrButton.propTypes = {
  hasExtractedText: PropTypes.bool,
  projectMediaId: PropTypes.string.isRequired,
  projectMediaType: PropTypes.oneOf(Object.values(CheckMediaTypes)).isRequired,
  setFlashMessage: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default withSetFlashMessage(OcrButton);
