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
        return data.user_name;
      default:
        return data.user_name || data.username || '';
    }
  },

  authorUsername(media, data) {
    switch (media.domain) {
      case 'twitter.com':
        return data.user ? `@${data.user.screen_name}` : ''; // data.username?
      case 'facebook.com':
        return data.username;
      case 'instagram.com':
        return `@${data.author_name}`;
      case 'youtube.com':
        return `@${data.username}`;
      default:
        return data.username || '';
    }
  },

  title(media, data) {
    switch (media.domain) {
      case 'twitter.com':
        return `Tweet by ${this.authorUsername(media, data)}`;
      case 'facebook.com':
        return `Facebook post by ${this.authorName(media, data)}`;
      case 'instagram.com':
        return `Instagram by ${this.authorUsername(media, data)}`;
      case 'youtube.com':
        return `Video by ${this.authorUsername(media, data)}`;
      default:
        return data.title;
    }
  }
}

export default MediaUtil;
