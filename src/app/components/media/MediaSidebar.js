import React from 'react';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import MediaClaim from './MediaClaim';
import MediaTags from './MediaTags';
import MediaFactCheck from './MediaFactCheck';
import MediaAnalysis from './MediaAnalysis';
import MediaSuggestionReview from './Similarity/MediaSuggestionReview';

const MediaSidebar = ({ projectMedia }) => (
  <Box id="media__sidebar">
    <Box my={2}>
      { projectMedia.suggested_main_item || projectMedia.confirmed_main_item || projectMedia.is_confirmed_similar_to_another_item ? <MediaSuggestionReview projectMedia={projectMedia} /> : null }
    </Box>
    <Box>
      <Box mt={2}>
        <MediaClaim projectMedia={projectMedia} />
      </Box>
      <Box mt={1}>
        <MediaTags projectMedia={projectMedia} />
      </Box>
      <Box my={2}>
        <MediaFactCheck projectMedia={projectMedia} />
      </Box>
      <MediaAnalysis projectMedia={projectMedia} />
    </Box>
  </Box>
);

MediaSidebar.propTypes = {
  projectMedia: PropTypes.object.isRequired, // FIXME: Detail which fields are expected
};

export default MediaSidebar;
