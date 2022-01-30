import React from 'react';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import MediaCreatedBy from './MediaCreatedBy';
import MediaClaim from './MediaClaim';
import MediaTags from './MediaTags';
import MediaFactCheck from './MediaFactCheck';
import MediaAnalysis from './MediaAnalysis';

const MediaSidebar = ({ projectMedia, onTimelineCommentOpen }) => (
  <Box id="media__sidebar">
    <Box my={2}>
      <MediaCreatedBy projectMedia={projectMedia} />
    </Box>
    { !projectMedia.is_secondary ?
      <Box>
        <Box my={2}>
          <MediaClaim projectMedia={projectMedia} />
        </Box>
        <MediaTags projectMedia={projectMedia} onTimelineCommentOpen={onTimelineCommentOpen} />
        <Box my={2}>
          <MediaFactCheck projectMedia={projectMedia} />
        </Box>
        <MediaAnalysis projectMedia={projectMedia} />
      </Box> : null }
  </Box>
);

MediaSidebar.propTypes = {
  projectMedia: PropTypes.object.isRequired, // FIXME: Detail which fields are expected
  onTimelineCommentOpen: PropTypes.func.isRequired,
};

export default MediaSidebar;
