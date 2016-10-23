import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

class MediaMetadataSummary extends Component {

  render() {
    const { media, data } = this.props;
    const annotationsCount = media.annotations_count; // TODO: filter to count of annotations displayed on timeline

    return (
      <div className='media-metadata-summary'>
        <span className='media-metadata-summary__datum'>{annotationsCount} note{annotationsCount === 1 ? '' : 's'}</span>
        <span className='media-metadata-summary__datum'>{media.domain}</span>
        <span className='media-metadata-summary__datum'>{data.username ? '@' + data.username : null}</span>
      </div>
    );
  }
}

export default MediaMetadataSummary;
