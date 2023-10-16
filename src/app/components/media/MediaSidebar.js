import React from 'react';
import PropTypes from 'prop-types';
import MediaClaim from './MediaClaim';
import MediaTags from './MediaTags';
import MediaFactCheck from './MediaFactCheck';
import MediaSuggestionReview from './Similarity/MediaSuggestionReview';
import styles from './media.module.css';

const MediaSidebar = ({ projectMedia }) => (
  <div id="media__sidebar" className={styles['media-item-claim']}>
    <div className={styles['media-item-content']}>
      { projectMedia.suggested_main_item || projectMedia.confirmed_main_item || projectMedia.is_confirmed_similar_to_another_item ?
        <MediaSuggestionReview projectMedia={projectMedia} />
        : null
      }
      <MediaClaim projectMedia={projectMedia} />
      <div className={styles['media-item-tags']}>
        <MediaTags projectMediaId={projectMedia.dbid} />
      </div>
      <MediaFactCheck projectMedia={projectMedia} />
    </div>
  </div>
);

MediaSidebar.propTypes = {
  projectMedia: PropTypes.object.isRequired, // FIXME: Detail which fields are expected
};

export default MediaSidebar;
