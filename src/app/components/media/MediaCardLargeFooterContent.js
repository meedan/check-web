import React from 'react';
import Box from '@material-ui/core/Box';
import LongShort from '../layout/LongShort';

const MediaCardLargeFooterContent = ({
  title,
  body,
  showAll,
}) => {
  if (!body) return null;

  return (
    <div className="media-card-large-footer-content">
      <div className="typography-body1">
        <Box color="var(--color-gray-37)">
          {title}
        </Box>
        <Box color="var(--color-gray-15)">
          <LongShort showAll={showAll} maxLines={2}>
            {body}
          </LongShort>
        </Box>
      </div>
    </div>
  );
};

export default MediaCardLargeFooterContent;
