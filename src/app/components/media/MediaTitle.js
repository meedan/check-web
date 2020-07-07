import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { truncateLength, emojify } from '../../helpers';
import MediaUtil from './MediaUtil';

/**
 * The API of a <FormattedMessage> with the value of null.
 *
 * Usage:
 *
 * <NullMessage>{value => value === null ? "always" : "never"}</NullMessage>
 */
const NullMessage = ({ children }) => children(null);

const MediaType = {
  Twitter: 'twitter',
  Facebook: 'facebook',
  Instagram: 'instagram',
  Youtube: 'youtube',
  Tiktok: 'tiktok',
  Claim: 'claim',
  Image: 'image',
  Page: 'page',
};

/**
 * A <FormattedMessage> or <NullMessage>, depending on media type.
 */
const TypeMessageOrNullMessage = ({ type, children }) => {
  switch (type) {
  case MediaType.Twitter:
    return <FormattedMessage id="media.typeTwitter" defaultMessage="Tweet">{children}</FormattedMessage>;
  case MediaType.Facebook:
    return <FormattedMessage id="media.typeFacebook" defaultMessage="Facebook post">{children}</FormattedMessage>;
  case MediaType.Instagram:
    return <FormattedMessage id="media.typeInstagram" defaultMessage="Instagram">{children}</FormattedMessage>;
  case MediaType.Youtube:
    return <FormattedMessage id="media.typeYoutube" defaultMessage="YouTube video">{children}</FormattedMessage>;
  case MediaType.Video:
    return <FormattedMessage id="media.typeVideo" defaultMessage="Video">{children}</FormattedMessage>;
  case MediaType.Tiktok:
    return <FormattedMessage id="media.typeTiktok" defaultMessage="TikTok video">{children}</FormattedMessage>;
  case MediaType.Claim:
    return <FormattedMessage id="media.typeClaim" defaultMessage="Text">{children}</FormattedMessage>;
  case MediaType.Image:
    return <FormattedMessage id="media.typeImage" defaultMessage="Image">{children}</FormattedMessage>;
  case MediaType.Page:
    return <FormattedMessage id="media.typePage" defaultMessage="Page">{children}</FormattedMessage>;
  default:
    return <NullMessage>{children}</NullMessage>;
  }
};
TypeMessageOrNullMessage.defaultProps = {
  type: null,
};
TypeMessageOrNullMessage.propTypes = {
  type: PropTypes.oneOf(Object.values(MediaType)), // or null
  children: PropTypes.func.isRequired,
};

function mediaTypeOrNull(projectMedia) {
  switch (projectMedia.domain) {
  case 'twitter.com': return MediaType.Twitter;
  case 'facebook.com': return MediaType.Facebook;
  case 'instagram.com': return MediaType.Instagram;
  case 'youtube.com': return MediaType.Youtube;
  case 'tiktok.com': return MediaType.Tiktok;
  default: // keep going
  }

  if (projectMedia.media.quote) {
    return MediaType.Claim;
  }
  if (projectMedia.media.embed_path) {
    return MediaType.Image;
  }
  if (projectMedia.domain) {
    return MediaType.Page;
  }
  return null;
}

const ByAttribution = ({ mediaType, projectMedia, children }) => {
  const attribution = MediaUtil.authorName(projectMedia, projectMedia.metadata);

  return (
    <TypeMessageOrNullMessage type={mediaType}>
      {typeLabel => attribution ? (
        <FormattedMessage
          id="media.byAttribution"
          defaultMessage="{typeLabel} by {attribution}"
          values={{ typeLabel, attribution }}
        >
          {children}
        </FormattedMessage>
      ) : typeLabel}
    </TypeMessageOrNullMessage>
  );
};

const PageOnDomain = ({ domain, children }) => (
  <TypeMessageOrNullMessage type={MediaType.Page}>
    {typeLabel => (
      <FormattedMessage
        id="media.onDomain"
        defaultMessage="{typeLabel} on {domain}"
        values={{ typeLabel, domain }}
      >
        {children}
      </FormattedMessage>
    )}
  </TypeMessageOrNullMessage>
);

function hasCustomTitle(projectMedia) {
  if (projectMedia.overridden.title) {
    return true;
  }
  const data = projectMedia.metadata;
  const title = data && data.title && data.title.trim();
  return title && projectMedia.quote && title !== projectMedia.quote;
}

/**
 * Renders `children(titleText)`.
 */
function MediaTitle({ projectMedia, children }) {
  const retval = (text) => {
    const niceText = emojify(truncateLength(text));
    return children === null ? niceText : children(niceText);
  };

  if (hasCustomTitle(projectMedia)) {
    return retval(projectMedia.metadata.title);
  }

  const mediaType = mediaTypeOrNull(projectMedia);

  switch (mediaType) {
  case MediaType.Page:
    return projectMedia.media.metadata.title
      ? retval(projectMedia.media.metadata.title)
      : <PageOnDomain domain={projectMedia.domain}>{retval}</PageOnDomain>;
  case MediaType.Claim:
    return retval(projectMedia.media.quote);
  case MediaType.Image:
    return retval(projectMedia.metadata.title);
  case MediaType.Facebook:
  case MediaType.Twitter:
  case MediaType.Instagram:
  case MediaType.Video:
  case MediaType.Tiktok:
    return projectMedia.media.metadata.title
      ? retval(projectMedia.media.metadata.title)
      : (
        <ByAttribution mediaType={mediaType} projectMedia={projectMedia}>
          {retval}
        </ByAttribution>
      );
  default: { // mediaType === null
    const text = projectMedia.media.quote || projectMedia.metadata.title;
    if (text) {
      return retval(text);
    }
    return (
      <ByAttribution mediaType={mediaType} projectMedia={projectMedia}>{retval}</ByAttribution>
    );
  }
  }
}
MediaTitle.defaultProps = {
  children: null,
};
MediaTitle.propTypes = {
  children: PropTypes.func, // render prop ... or null
  projectMedia: PropTypes.shape({
    media: PropTypes.shape({
      embed_path: PropTypes.string, // or null?
      metadata: PropTypes.object.isRequired,
      quote: PropTypes.string, // or null
    }).isRequired,
    domain: PropTypes.string, // or null
    metadata: PropTypes.object.isRequired,
    overridden: PropTypes.object.isRequired,
    quote: PropTypes.string, // or null
  }).isRequired,
};
export { MediaTitle };

export default createFragmentContainer(MediaTitle, graphql`
  fragment MediaTitle_projectMedia on ProjectMedia {
    media {
      embed_path
      metadata
      quote
    }
    domain  # for this file, and for MediaUtil.authorName()
    metadata
    overridden
    quote
  }
`);
