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
      <Box display="flex" alignItems="center" mt={0.5} mb={0.5}>
        <Box mr={1} display="flex" alignItems="center">
          <MediaTypeDisplayIcon mediaType={mediaType} />
        </Box>
        <Typography
          variant="subtitle2"
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minWidth: 0, /* https://css-tricks.com/flexbox-truncated-text/#aa-the-solution-is-min-width-0-on-the-flex-child */
          }}
        >
          {slug}
        </Typography>
      </Box>
      <BulletSeparator compact details={details} />
    </div>
  </>
);

MediaSlug.propTypes = {
  mediaType: PropTypes.string.isRequired,
  slug: PropTypes.string.isRequired,
  details: PropTypes.array.isRequired,
};

export default MediaSlug;
