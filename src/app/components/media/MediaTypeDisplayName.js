import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

export default function MediaTypeDisplayName({ mediaType }) {
  switch (mediaType) {
  case 'Claim':
    return <FormattedMessage id="media.typeClaim" defaultMessage="Text" />;
  case 'Link':
    return <FormattedMessage id="media.typeLink" defaultMessage="Link" />;
  case 'UploadedImage':
    return <FormattedMessage id="media.typeImage" defaultMessage="Image" />;
  case 'UploadedVideo':
    return <FormattedMessage id="media.typeVideo" defaultMessage="Video" />;
  case 'UploadedAudio':
    return <FormattedMessage id="media.typeAudio" defaultMessage="Audio" />;
  case '-':
  default:
    return <React.Fragment>-</React.Fragment>;
  }
}
MediaTypeDisplayName.MediaTypeShape = PropTypes.oneOf([
  'Claim', 'Link', 'UploadedImage', 'UploadedVideo', 'UploadedAudio', '-',
]);
MediaTypeDisplayName.propTypes = {
  mediaType: MediaTypeDisplayName.MediaTypeShape.isRequired,
};
