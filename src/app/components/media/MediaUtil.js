import lodashTruncate from 'lodash.truncate';
import numerous from 'numerous';

const MediaUtil = {
  url(media, data) {
    try {
      return media.url || data.url || '';
    } catch (e) {
      return '';
    }
  },

  networkIconName(media) {
    try {
      return ({ // uncomment in font-awesome/_icons.scss
        'facebook.com': 'facebook-square',
        'instagram.com': 'instagram',
        'twitter.com': 'twitter',
        'youtube.com': 'youtube-play'
      }[media.domain] || 'link');
    } catch (e) {
      return '';
    }
  },

  authorAvatarUrl(media, data) {
    try {
      return ({
        'twitter.com': data.picture,
        'facebook.com': data.picture,
        // 'instagram.com': data.picture, // returns media image url
        // 'youtube.com': data.picture // returns media image url
      }[media.domain]);
    } catch (e) {
      return '';
    }
  },

  authorName(media, data) {
    try {
      switch (media.domain) {
        case 'twitter.com':
          return data.user ? data.user.name : '';
        case 'facebook.com':
          return data.user_name;
        case 'youtube.com':
          return data.username;
        case 'instagram.com':
          return data.username;
        default:
          return data.user_name || data.username || '';
      }
    } catch (e) {
      return  '';
    }
  },

  authorUsername(media, data) {
    try {
      switch (media.domain) {
        case 'twitter.com':
          return data.user ? `@${data.user.screen_name}` : ''; // data.username?
        case 'facebook.com':
          return '';
        case 'instagram.com':
          return `@${data.author_name}`;
        case 'youtube.com':
          return `@${data.username}`;
        default:
          return data.username || '';
      }
    } catch (e) {
      return '';
    }
  },

  authorUrl(media, data) {
    try {
      return data.author_url;
    } catch (e) {
      return '';
    }
  },

  typeLabel(media, data) {
    try {
      const socialMedia = ({
        'twitter.com': 'Tweet',
        'facebook.com': 'Facebook post',
        'instagram.com': 'Instagram',
        'youtube.com': 'Video'
      }[media.domain]);

      if (socialMedia) {
        return socialMedia;
      }
      if (data && data.quote) {
       return 'Claim';
      }
      if (media && media.domain) {
        return 'Page';
      }
    } catch (e) {}
    return '';
  },

  title(media, data) {
    if (data && data.title && data.title.trim().length) {
      return this.truncate(data.title);
    }

    var typeLabel;
    try {
      typeLabel = this.typeLabel(media, data);
      if (typeLabel === 'Page') {
        return `${typeLabel} on ${media.domain}`;
      }
      else if (typeLabel === 'Claim') {
        const text = data.quote;
        return `${typeLabel}${text ? ': ' + text : ''}`;
      }
      else {
        const attribution = this.authorName(media, data);
        const text = this.bodyText(media, data);
        return `${typeLabel}${attribution ? ' by ' + attribution : ''}${text && text.length ? ': ' + text : ''}`;
      }
    } catch (e) {
      return typeLabel || '';
    }
  },

  truncatedTitle(media, data) {
    return this.truncate(this.title(media, data));
  },

  truncate(text, length = 100) {
    return lodashTruncate(text, {length: length, separator: /,? +/, ellipsis: '…'});
  },

  // Return a text fragment "X notes" with proper pluralization.
  notesCount(media, data) {
    const word = numerous.pluralize('en', media.annotations_count, {
      one: 'note',
      other: 'notes'
    });
    return "" + media.annotations_count + " " + word;
  },

  createdAt(media) { // check media
    var date = '';
    try {
      date = new Date(parseInt(media.published) * 1000);
      if (isNaN(date)) date = null;
    } catch (e) {
      date = null;
    }
    return date;
  },

  embedPublishedAt(media, data) { // embedded media
    var date = '';
    try {
      date = new Date(data.published_at);
      if (isNaN(date)) date = null;
    } catch (e) {
      date = null;
    }
    return date;
  },

  bodyText(media, data) {
    try {
      return ({
        'twitter.com': data.text,
        'facebook.com': data.text,
        'instagram.com': data.description,
        'youtube.com': 'Video'
      }[media.domain] || data.text || data.description || '');
    } catch (e) {
      return '';
    }
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
          `${data.favorite_count || 0} favorite${data.favorite_count !== 1 ? 's' : ''}`,
          `${data.retweet_count || 0} retweet${data.retweet_count !== 1 ? 's' : ''}`
        ]
      }[media.domain] || []);
    } catch (e) {
      return [];
    }
  }
}

export default MediaUtil;
