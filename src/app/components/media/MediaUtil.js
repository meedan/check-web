import truncate from 'lodash.truncate';

const MediaUtil = {
  networkIconName(media) {
    return ({
      'facebook.com': 'facebook-square',
      'youtube.com': 'youtube-play',
    }[media.domain] || media.domain.split('.')[0]);
  },

  authorName(media, data) {
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
        return (data ? data.user_name || data.username || '' : '');
    }
  },

  authorUsername(media, data) {
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
        return (data ? data.username || '' : '');
    }
  },

  typeLabel(media, data) {
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
    return 'Report';
  },

  title(media, data) {
    const typeLabel = this.typeLabel(media, data);
    if (typeLabel === 'Page') {
      return `${typeLabel} on ${media.domain}`;
    }
    else if (typeLabel === 'Claim') {
      const text = truncate(data.quote, {length: 50, separator: /,? +/, ellipsis: '…'});
      return `${typeLabel}${text ? ': ' + text : ''}`;
    }
    else {
      const attribution = this.authorName(media, data);
      return `${typeLabel}${attribution ? ' by ' + attribution : ''}`;
    }
  },

  notesCount(media, data) {
    return media.annotations_count; // TODO: filter to visible notes
  }
}

export default MediaUtil;
