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
  compact,
}) => (
  <>
    <div>
      <Box display="flex" alignItems="center">
        <MediaTypeDisplayIcon mediaType={mediaType} />
        <Typography
          variant="subtitle2"
          style={{ minWidth: 0 }} /* https://css-tricks.com/flexbox-truncated-text/#aa-the-solution-is-min-width-0-on-the-flex-child */
        >
          {slug}
        </Typography>
      </Box>
      <BulletSeparator details={details} compact={compact} />
    </div>
  </>
);

MediaSlug.defaultProps = {
  compact: false,
};

MediaSlug.propTypes = {
  mediaType: PropTypes.string.isRequired,
  slug: PropTypes.string.isRequired,
  details: PropTypes.array.isRequired,
  compact: PropTypes.bool,
};

export default MediaSlug;
