import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

class MediaMetadataSummary extends Component {

  render() {
    const { media, data } = this.props;

    return (
      <div className='media-metadata-summary'>
        <span className='media-metadata-summary__datum'>{media.annotations_count} notes</span>
        <span className='media-metadata-summary__datum'>{media.domain}</span>
        <span className='media-metadata-summary__datum'>{data.username ? '@' + data.username : null}</span>
      </div>
    );
  }
}

export default MediaMetadataSummary;
