import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import util from './MediaUtil';

class MediaMetadataSummary extends Component {

  render() {
    const { media, data } = this.props;
    const annotationsCount = util.notesCount(media, data);
    const authorUsername = util.authorUsername(media, data);

    return (
      <div className="media-metadata-summary">
        <span className="media-metadata-summary__datum">{annotationsCount}</span>
        {media.domain ? <span className="media-metadata-summary__datum">{media.domain}</span> : null}
        {authorUsername ? <span className="media-metadata-summary__datum">{authorUsername}</span> : null}
      </div>
    );
  }
}

export default MediaMetadataSummary;
