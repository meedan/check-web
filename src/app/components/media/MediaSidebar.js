import React from 'react';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import MediaClaim from './MediaClaim';
import MediaTags from './MediaTags';
import MediaFactCheck from './MediaFactCheck';
import MediaAnalysis from './MediaAnalysis';
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
      <Box mt={1}>
        <MediaTags projectMedia={projectMedia} />
      </Box>
      <Box my={2}>
        <MediaFactCheck projectMedia={projectMedia} />
      </Box>
      <MediaAnalysis projectMedia={projectMedia} />
    </div>
  </div>
);

MediaSidebar.propTypes = {
  projectMedia: PropTypes.object.isRequired, // FIXME: Detail which fields are expected
};

export default MediaSidebar;
