import { defineMessages } from 'react-intl';
import { truncate } from '../../helpers';

const messages = defineMessages({
  notesCount: {
    id: 'media.notesCount',
    defaultMessage: '{notesCount, plural, =0 {No notes} one {1 note} other {{notesCount} notes}}'
  },
  typeTwitter: {
    id: 'media.typeTwitter',
    defaultMessage: 'Tweet'
  },
  typeFacebook: {
    id: 'media.typeFacebook',
    defaultMessage: 'Facebook post'
  },
  typeInstagram: {
    id: 'media.typeInstagram',
    defaultMessage: 'Instagram'
  },
  typeVideo: {
    id: 'media.typeVideo',
    defaultMessage: 'Video'
  },
  typeClaim: {
    id: 'media.typeClaim',
    defaultMessage: 'Claim'
  },
  typeImage: {
    id: 'media.typeImage',
    defaultMessage: 'Image'
  },
  typePage: {
    id: 'media.typePage',
    defaultMessage: 'Page'
  },
  onDomain: {
    id: 'media.onDomain',
    defaultMessage: '{typeLabel} on {domain}'
  },
  byAttribution: {
    id: 'media.byAttribution',
    defaultMessage: '{typeLabel} by {attribution}'
  },
  withText: {
    id: 'media.withText',
    defaultMessage: '{typeLabel}: {text}'
  },
  favoritesCount: {
    id: 'media.favoritesCount',
    defaultMessage: '{favoritesCount, plural, =0 {} one {1 favorite} other {{favoritesCount} favorites}}'
  },
  retweetsCount: {
    id: 'media.retweetsCount',
    defaultMessage: '{retweetsCount, plural, =0 {} one {1 retweet} other {{retweetsCount} retweets}}'
  }
});

const MediaUtil = {
  url(media, data) {
    try {
      return media.url || data.url || '';
    } catch (e) {
      return '';
    }
  },

  authorAvatarUrl(media, data) {
    return data.author_picture;
  },

  authorName(media, data) {
    switch (media.domain) {
    case 'twitter.com':
      return data.user ? data.user.name : '';
    case 'instagram.com':
      return data.author_name;
    case 'facebook.com':
      return data.user_name;
    default:
      return data.username || media.domain;
    }
  },

  authorUsername(media, data) {
    switch (media.domain) {
    case 'twitter.com':
    case 'instagram.com':
      return `@${data.username}`;
    case 'facebook.com':
      return data.username;
    case 'youtube.com':
      return '';
    default:
      return data.username;
    }
  },

  authorUrl(media, data) {
    return data.author_url;
  },

  mediaType(media, data) {
    let type = null;
    try {
      const socialMedia = ({
        'twitter.com': messages.typeTwitter,
        'facebook.com': messages.typeFacebook,
        'instagram.com': messages.typeInstagram,
        'youtube.com': messages.typeVideo,
      }[media.domain]);

      if (socialMedia) {
        type = socialMedia;
      }
      else if (media.quote) {
        type = messages.typeClaim;
      }
      else if (media.embed_path) {
        type = messages.typeImage;
      }
      else if (media.domain) {
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
    return type ? type.id.replace('media.type', '').toLowerCase() : '';
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
        return intl.formatMessage(messages.onDomain, {typeLabel, domain: media.domain});
      } else if (type === messages.typeImage) {
        return data.title || typeLabel;
      } else if (type === messages.typeClaim) {
        return (data.title && data.title != media.quote) ? data.title : typeLabel;
      }
      const attribution = this.authorName(media, data);
      return attribution ? intl.formatMessage(messages.byAttribution, {typeLabel, attribution}) : typeLabel;
    } catch (e) {
      return typeLabel || '';
    }
  },

  title(media, data, intl) {
    if (data && data.title && data.title.trim().length) {
      return truncate(data.title);
    }

    let typeLabel = null;
    try {
      const type = this.mediaType(media, data);
      typeLabel = intl.formatMessage(type);
      if (type === messages.typePage) {
        return intl.formatMessage(messages.onDomain, {typeLabel, domain: media.domain});
      } else if (type === messages.typeClaim) {
        const text = data.quote;
        return text ? intl.formatMessage(messages.withText, {typeLabel, text}) : typeLabel;
      }
      const attribution = this.authorName(media, data);
      const text = this.bodyText(media, data);
      const byAttribution = attribution ? intl.formatMessage(messages.byAttribution, {typeLabel, attribution}) : typeLabel;
      return text ? intl.formatMessage(messages.withText, {typeLabel: byAttribution, text}) : byAttribution;
    } catch (e) {
      return typeLabel || '';
    }
  },

  truncatedTitle(media, data, intl) {
    return truncate(this.title(media, data, intl));
  },

  // Return a text fragment "X notes" with proper pluralization.
  notesCount(media, data, intl) {
    return intl.formatMessage(messages.notesCount, {notesCount: media.annotations_count})
  },

  createdAt(media) { // check media
    let date = null;
    try {
      date = new Date(parseInt(media.published) * 1000);
      if (isNaN(date)) date = null;
    } catch (e) {
      date = null;
    }
    return date;
  },

  embedPublishedAt(media, data) { // embedded media
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
    try {
      switch (media.domain) {
      case 'twitter.com':
        return data.entities.media[0].media_url_https || data.entities.media[0].media_url;
      case 'facebook.com':
        return data.photos[0];
      case 'instagram.com':
        return data.picture;
      case 'youtube.com':
        return data.picture;
      }
    } catch (e) {
      return null;
    }
  },

  stats(media, data) {
    try {
      return ({
        'twitter.com': [
          intl.formatMessage(messages.favoritesCount, {favoritesCount: data.favorite_count}),
          intl.formatMessage(messages.retweetsCount, {retweetsCount: data.retweet_count}),
        ],
      }[media.domain] || []);
    } catch (e) {
      return [];
    }
  },
};

export default MediaUtil;
