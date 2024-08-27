import React from 'react';
import Box from '@material-ui/core/Box';
import LongShort from '../layout/LongShort';

const MediaCardLargeFooterContent = ({
  body,
  showAll,
  title,
}) => {
  if (!body) return null;

  return (
    <div className="media-card-large-footer-content">
      <div className="typography-body1">
        <Box color="var(--color-gray-37)">
          {title}
        </Box>
        <Box color="var(--color-gray-15)">
          <LongShort maxLines={2} showAll={showAll}>
            {body}
          </LongShort>
        </Box>
      </div>
    </div>
  );
};

export default MediaCardLargeFooterContent;
