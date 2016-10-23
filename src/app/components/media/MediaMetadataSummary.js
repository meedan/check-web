import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import util from './MediaUtil';

class MediaMetadataSummary extends Component {

  render() {
    const { media, data } = this.props;
    const annotationsCount = media.annotations_count; // TODO: filter to count of annotations displayed on timeline

    return (
      <div className='media-metadata-summary'>
        <span className='media-metadata-summary__datum'>{annotationsCount} note{annotationsCount === 1 ? '' : 's'}</span>
        <span className='media-metadata-summary__datum'>{media.domain}</span>
        <span className='media-metadata-summary__datum'>{util.authorUsername(media, data)}</span>
      </div>
    );
  }
}

export default MediaMetadataSummary;
