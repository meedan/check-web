import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

export default function MediaTypeDisplayName({ mediaType }) {
  switch (mediaType) {
  case 'Claim':
    return <FormattedMessage defaultMessage="Text" description="Label to show that the type of media is text" id="media.typeClaim" />;
  case 'Link':
    return <FormattedMessage defaultMessage="Link" description="Label to show that the type of media is a link" id="media.typeLink" />;
  case 'UploadedImage':
    return <FormattedMessage defaultMessage="Image" description="Label to show that the type of media is an image" id="media.typeImage" />;
  case 'UploadedVideo':
    return <FormattedMessage defaultMessage="Video" description="Label to show that the type of media is a video" id="media.typeVideo" />;
  case 'UploadedAudio':
    return <FormattedMessage defaultMessage="Audio" description="Label to show that the type of media is an audio file" id="media.typeAudio" />;
  case 'Blank':
    return <FormattedMessage defaultMessage="Imported fact-check" description="Label to show that the type of media is was imported into the application" id="media.typeBlank" />;
  case 'Facebook':
    return <FormattedMessage defaultMessage="Facebook Post" description="Label to show that the type of media is a Facebook post" id="media.typeFacebook" />;
  case 'Instagram':
    return <FormattedMessage defaultMessage="Instagram Post" description="Label to show that the type of media is an Instagram post" id="media.typeInstagram" />;
  case 'Telegram':
    return <FormattedMessage defaultMessage="Telegram" description="Label to show that the type of media is a Telegram message" id="media.typeTelegram" />;
  case 'Tiktok':
    return <FormattedMessage defaultMessage="TikTok Post" description="Label to show that the type of media is a Tiktok video" id="media.typeTiktok" />;
  case 'Twitter':
    return <FormattedMessage defaultMessage="X (Twitter) Post" description="Label to show that the type of media is a Twitter tweet" id="media.typeTwitter" />;
  case 'Youtube':
    return <FormattedMessage defaultMessage="Youtube Video" description="Label to show that the type of media is a Youtube video" id="media.typeYoutube" />;
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
