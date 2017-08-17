import React from 'react';
import FaFacebookSquare from 'react-icons/lib/fa/facebook-square';
import FaInstagram from 'react-icons/lib/fa/instagram';
import FaTwitter from 'react-icons/lib/fa/twitter';
import FaYoutubePlay from 'react-icons/lib/fa/youtube-play';
import MdLink from 'react-icons/lib/md/link';
import { defineMessages } from 'react-intl';
import config from 'config';
import { truncateLength } from '../../helpers';

const messages = defineMessages({
  notesCount: {
    id: 'media.notesCount',
    defaultMessage: '{notesCount, plural, =0 {No notes} one {1 note} other {# notes}}',
  },
  typeTwitter: {
    id: 'media.typeTwitter',
    defaultMessage: 'Tweet',
  },
  typeFacebook: {
    id: 'media.typeFacebook',
    defaultMessage: 'Facebook post',
  },
  typeInstagram: {
    id: 'media.typeInstagram',
    defaultMessage: 'Instagram',
  },
  typeVideo: {
    id: 'media.typeVideo',
    defaultMessage: 'Video',
  },
  typeClaim: {
    id: 'media.typeClaim',
    defaultMessage: 'Claim',
  },
  bridge_typeClaim: {
    id: 'bridge.media.typeClaim',
    defaultMessage: 'Quote',
  },
  typeImage: {
    id: 'media.typeImage',
    defaultMessage: 'Image',
  },
  typePage: {
    id: 'media.typePage',
    defaultMessage: 'Page',
  },
  onDomain: {
    id: 'media.onDomain',
    defaultMessage: '{typeLabel} on {domain}',
  },
  byAttribution: {
    id: 'media.byAttribution',
    defaultMessage: '{typeLabel} by {attribution}',
  },
  withText: {
    id: 'media.withText',
    defaultMessage: '{typeLabel}: {text}',
  },
  favoritesCount: {
    id: 'media.favoritesCount',
    defaultMessage: '{favoritesCount, plural, =0 {} one {1 favorite} other {# favorites}}',
  },
  retweetsCount: {
    id: 'media.retweetsCount',
    defaultMessage: '{retweetsCount, plural, =0 {} one {1 retweet} other {# retweets}}',
  },
});

const MediaUtil = {
  url(media, data) {
    try {
      return media.url || data.url || '';
    } catch (e) {
      return '';
    }
  },

  authorName(media, data) {
    return data.author_name || media.domain;
  },

  authorUsername(media, data) {
    return data.username;
  },

  authorUrl(media, data) {
    return data.author_url;
  },

  mediaType(media) {
    let type = null;
    try {
      const socialMedia = {
        'twitter.com': messages.typeTwitter,
        'facebook.com': messages.typeFacebook,
        'instagram.com': messages.typeInstagram,
        'youtube.com': messages.typeVideo,
      }[media.domain];

      if (socialMedia) {
        type = socialMedia;
      } else if (media.quote) {
        type = config.appName === 'check' ? messages.typeClaim : messages.bridge_typeClaim;
      } else if (media.embed_path) {
        type = messages.typeImage;
      } else if (media.domain) {
        type = messages.typePage;
      }
    } catch (e) {
      type = messages.typePage;
    }
    return type;
  },

  // Return a CSS-friendly media type.
  mediaTypeCss(media, data) {
    const type = this.mediaType(media, data);
    return type ? type.id.replace(/^.*media\.type/, '').toLowerCase() : '';
  },

  typeLabel(media, data, intl) {
    const type = this.mediaType(media, data);
    return type ? intl.formatMessage(type) : '';
  },

  attributedType(media, data, intl) {
    let typeLabel = null;
    try {
      const type = this.mediaType(media, data);
      typeLabel = intl.formatMessage(type);
      if (type === messages.typePage) {
        return intl.formatMessage(messages.onDomain, { typeLabel, domain: media.domain });
      } else if (type === messages.typeImage) {
        return data.title || typeLabel;
      } else if (type === messages.typeClaim) {
        return data.title && data.title !== media.quote ? data.title : typeLabel;
      }
      const attribution = this.authorName(media, data);
      return attribution
        ? intl.formatMessage(messages.byAttribution, { typeLabel, attribution })
        : typeLabel;
    } catch (e) {
      return typeLabel || '';
    }
  },

  title(media, data, intl) {
    if (data && data.title && data.title.trim().length) {
      return truncateLength(data.title);
    }

    let typeLabel = null;
    try {
      const type = this.mediaType(media, data);
      typeLabel = intl.formatMessage(type);
      if (type === messages.typePage) {
        return intl.formatMessage(messages.onDomain, { typeLabel, domain: media.domain });
      } else if (type === messages.typeClaim) {
        const text = data.quote;
        return text ? intl.formatMessage(messages.withText, { typeLabel, text }) : typeLabel;
      }
      const attribution = this.authorName(media, data);
      const text = this.bodyText(media, data);
      const byAttribution = attribution
        ? intl.formatMessage(messages.byAttribution, { typeLabel, attribution })
        : typeLabel;
      return text
        ? intl.formatMessage(messages.withText, { typeLabel: byAttribution, text })
        : byAttribution;
    } catch (e) {
      return typeLabel || '';
    }
  },

  // Return a text fragment "X notes" with proper pluralization.
  notesCount(media, data, intl) {
    return intl.formatMessage(messages.notesCount, { notesCount: media.log_count });
  },

  createdAt(media) {
    // check media
    let date = null;
    try {
      date = new Date(parseInt(media.published, 10) * 1000);
      if (isNaN(date)) date = null;
    } catch (e) {
      date = null;
    }
    return date;
  },

  embedPublishedAt(media, data) {
    // embedded media
    let date = null;
    try {
      date = new Date(data.published_at);
      if (isNaN(date)) date = null;
    } catch (e) {
      date = null;
    }
    return date;
  },

  bodyText(media, data) {
    return data.description;
  },

  bodyImageUrl(media, data) {
    return data.picture;
  },

  socialIcon(domain) {
    switch (domain) {
    case 'twitter.com':
      return <FaTwitter />;
    case 'youtube.com':
      return <FaYoutubePlay />;
    case 'instagram.com':
      return <FaInstagram />;
    case 'facebook.com':
      return <FaFacebookSquare />;
    default:
      return <MdLink />;
    }
  },

  stats(media, data, intl) {
    try {
      return (
        {
          'twitter.com': [
            intl.formatMessage(messages.favoritesCount, {
              favoritesCount: data.raw.api.favorite_count,
            }),
            intl.formatMessage(messages.retweetsCount, {
              retweetsCount: data.raw.api.retweet_count,
            }),
          ],
        }[media.domain] || []
      );
    } catch (e) {
      return [];
    }
  },
};

export default MediaUtil;
