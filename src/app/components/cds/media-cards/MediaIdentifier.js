import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl';
import CopyToClipboard from 'react-copy-to-clipboard';
import { FlashMessageSetterContext } from '../../FlashMessage';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import MediaTypeDisplayIcon from '../../media/MediaTypeDisplayIcon';
import { getMediaTypeDisplayName } from '../../media/MediaTypeDisplayName';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';

const MediaIdentifier = ({
  intl,
  mediaType,
  slug,
  theme,
  tooltip,
  variant,
}) => {
  const setFlashMessage = React.useContext(FlashMessageSetterContext);

  const swallowClick = (e) => {
    e.stopPropagation();
  };

  const handleCopyToClipboard = () => {
    setFlashMessage((
      <FormattedMessage
        defaultMessage="The media identifier has been copied to the clipboard"
        description="success message for when the identifier slug for this piece of media has been copied to the clipboard"
        id="mediaIdentifier.copiedToClipboard"
      />
    ), 'success');
  };

  const buttonContent = (
    <span>
      <CopyToClipboard text={slug} onCopy={handleCopyToClipboard}>
        <ButtonMain
          iconLeft={<MediaTypeDisplayIcon mediaType={mediaType} />}
          label={slug}
          maxWidth
          size="small"
          theme={theme}
          variant={variant}
          onClick={swallowClick}
        />
      </CopyToClipboard>
    </span>
  );

  return (
    tooltip ?
      <Tooltip
        arrow
        placement="top"
        title={(
          <>
            <FormattedHTMLMessage
              defaultMessage="Click to Copy <strong>{mediaTypeName}</strong> Identifier to the Clipboard:"
              description="Message to the user describing the requirements for uploading an image"
              id="mediaIdentifier.copy"
              tagName="div"
              values={{
                mediaTypeName: getMediaTypeDisplayName(mediaType, intl),
              }}
            />
            <ul>
              <li>{slug}</li>
            </ul>
          </>
        )}
      >
        {buttonContent}
      </Tooltip>
      : buttonContent
  );
};

MediaIdentifier.propTypes = {
  mediaType: PropTypes.string.isRequired,
  slug: PropTypes.any.isRequired,
  theme: PropTypes.string,
  tooltip: PropTypes.bool,
  variant: PropTypes.string,
};

MediaIdentifier.defaultProps = {
  variant: 'contained',
  theme: 'lightBeige',
  tooltip: true,
};

export default injectIntl(MediaIdentifier);
