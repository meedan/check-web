import React from 'react';
import { FormattedMessage, defineMessages } from 'react-intl';
import CheckMediaTypes from '../../constants/CheckMediaTypes';
import CheckPropTypes from '../../CheckPropTypes';

const messages = defineMessages({
  Claim: {
    defaultMessage: 'Text',
    description: 'Label to show that the type of media is text',
    id: 'media.typeClaim',
  },
  Link: {
    defaultMessage: 'Link',
    description: 'Label to show that the type of media is a link',
    id: 'media.typeLink',
  },
  UploadedImage: {
    defaultMessage: 'Image',
    description: 'Label to show that the type of media is an image',
    id: 'media.typeImage',
  },
  UploadedVideo: {
    defaultMessage: 'Video',
    description: 'Label to show that the type of media is a video',
    id: 'media.typeVideo',
  },
  UploadedAudio: {
    defaultMessage: 'Audio',
    description: 'Label to show that the type of media is an audio file',
    id: 'media.typeAudio',
  },
  Blank: {
    defaultMessage: 'Imported fact-check',
    description: 'Label to show that the type of item is an imported fact-check',
    id: 'media.typeBlank',
  },
  Facebook: {
    defaultMessage: 'Facebook Post',
    description: 'Label to show that the type of media is a Facebook post',
    id: 'media.typeFacebook',
  },
  Instagram: {
    defaultMessage: 'Instagram Post',
    description: 'Label to show that the type of media is an Instagram post',
    id: 'media.typeInstagram',
  },
  Telegram: {
    defaultMessage: 'Telegram',
    description: 'Label to show that the type of media is a Telegram message',
    id: 'media.typeTelegram',
  },
  Tiktok: {
    defaultMessage: 'TikTok Post',
    description: 'Label to show that the type of media is a Tiktok video',
    id: 'media.typeTiktok',
  },
  Twitter: {
    defaultMessage: 'X (Twitter) Post',
    description: 'Label to show that the type of media is a Twitter tweet',
    id: 'media.typeTwitter',
  },
  Youtube: {
    defaultMessage: 'Youtube Video',
    description: 'Label to show that the type of media is a Youtube video',
    id: 'media.typeYoutube',
  },
});

const getMediaTypeDisplayName = (mediaType, intl) => intl.formatMessage(messages[mediaType]);

export { getMediaTypeDisplayName };

export default function MediaTypeDisplayName({ mediaType }) {
  switch (mediaType) {
  case CheckMediaTypes.CLAIM:
    return <FormattedMessage defaultMessage="Text" description="Label to show that the type of media is text" id="media.typeClaim" />;
  case CheckMediaTypes.LINK:
    return <FormattedMessage defaultMessage="Link" description="Label to show that the type of media is a link" id="media.typeLink" />;
  case CheckMediaTypes.UPLOADED_IMAGE:
    return <FormattedMessage defaultMessage="Image" description="Label to show that the type of media is an image" id="media.typeImage" />;
  case CheckMediaTypes.UPLOADED_VIDEO:
    return <FormattedMessage defaultMessage="Video" description="Label to show that the type of media is a video" id="media.typeVideo" />;
  case CheckMediaTypes.UPLOADED_AUDIO:
    return <FormattedMessage defaultMessage="Audio" description="Label to show that the type of media is an audio file" id="media.typeAudio" />;
  case CheckMediaTypes.BLANK:
    return <FormattedMessage defaultMessage="Imported fact-check" description="Label to show that the type of item is an imported fact-check" id="media.typeBlank" />;
  case CheckMediaTypes.FACEBOOK:
    return <FormattedMessage defaultMessage="Facebook Post" description="Label to show that the type of media is a Facebook post" id="media.typeFacebook" />;
  case CheckMediaTypes.INSTAGRAM:
    return <FormattedMessage defaultMessage="Instagram Post" description="Label to show that the type of media is an Instagram post" id="media.typeInstagram" />;
  case CheckMediaTypes.TELEGRAM:
    return <FormattedMessage defaultMessage="Telegram" description="Label to show that the type of media is a Telegram message" id="media.typeTelegram" />;
  case CheckMediaTypes.TIKTOK:
    return <FormattedMessage defaultMessage="TikTok Post" description="Label to show that the type of media is a Tiktok video" id="media.typeTiktok" />;
  case CheckMediaTypes.TWITTER:
    return <FormattedMessage defaultMessage="X (Twitter) Post" description="Label to show that the type of media is a Twitter tweet" id="media.typeTwitter" />;
  case CheckMediaTypes.YOUTUBE:
    return <FormattedMessage defaultMessage="Youtube Video" description="Label to show that the type of media is a Youtube video" id="media.typeYoutube" />;
  case '-':
  default:
    return <React.Fragment>-</React.Fragment>;
  }
}

MediaTypeDisplayName.propTypes = {
  mediaType: CheckPropTypes.mediaType.isRequired,
};
