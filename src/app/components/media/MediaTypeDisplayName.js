import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

export default function MediaTypeDisplayName({ mediaType }) {
  switch (mediaType) {
  case 'Claim':
    return <FormattedMessage id="media.typeClaim" defaultMessage="Text" description="Label to show that the type of media is text" />;
  case 'Link':
    return <FormattedMessage id="media.typeLink" defaultMessage="Link" description="Label to show that the type of media is a link" />;
  case 'UploadedImage':
    return <FormattedMessage id="media.typeImage" defaultMessage="Image" description="Label to show that the type of media is an image" />;
  case 'UploadedVideo':
    return <FormattedMessage id="media.typeVideo" defaultMessage="Video" description="Label to show that the type of media is a video" />;
  case 'UploadedAudio':
    return <FormattedMessage id="media.typeAudio" defaultMessage="Audio" description="Label to show that the type of media is an audio file" />;
  case 'Blank':
    return <FormattedMessage id="media.typeBlank" defaultMessage="Imported fact-check" description="Label to show that the type of media is was imported into the application" />;
  case 'Facebook':
    return <FormattedMessage id="media.typeFacebook" defaultMessage="Facebook Post" description="Label to show that the type of media is a Facebook post" />;
  case 'Instagram':
    return <FormattedMessage id="media.typeInstagram" defaultMessage="Instagram Post" description="Label to show that the type of media is an Instagram post" />;
  case 'Telegram':
    return <FormattedMessage id="media.typeTelegram" defaultMessage="Telegram" description="Label to show that the type of media is a Telegram message" />;
  case 'Tiktok':
    return <FormattedMessage id="media.typeTiktok" defaultMessage="TikTok Post" description="Label to show that the type of media is a Tiktok video" />;
  case 'Twitter':
    return <FormattedMessage id="media.typeTwitter" defaultMessage="X (Twitter) Post" description="Label to show that the type of media is a Twitter tweet" />;
  case 'Youtube':
    return <FormattedMessage id="media.typeYoutube" defaultMessage="Youtube Video" description="Label to show that the type of media is a Youtube video" />;
  case '-':
  default:
    return <React.Fragment>-</React.Fragment>;
  }
}
MediaTypeDisplayName.MediaTypeShape = PropTypes.oneOf([
  'Claim', 'Link', 'UploadedImage', 'UploadedVideo', 'UploadedAudio', 'Blank', '-',
]);
MediaTypeDisplayName.propTypes = {
  mediaType: MediaTypeDisplayName.MediaTypeShape.isRequired,
};
