const MediaUtil = {
  authorName(media, data) {
    return data.author_name || media.domain;
  },
};

export default MediaUtil;
