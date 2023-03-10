import React from 'react';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import MediaTypeDisplayIcon from './MediaTypeDisplayIcon';
import BulletSeparator from '../layout/BulletSeparator';

const MediaSlug = ({
  mediaType,
  slug,
  details,
}) => (
  <>
    <div>
      <Box display="flex" alignItems="center">
        <MediaTypeDisplayIcon mediaType={mediaType} />
        <Typography variant="subtitle2">{slug}</Typography>
      </Box>
      <BulletSeparator details={details} />
    </div>
  </>
);

MediaSlug.propTypes = {
  mediaType: PropTypes.string.isRequired,
  slug: PropTypes.string.isRequired,
  details: PropTypes.array.isRequired,
};

export default MediaSlug;
