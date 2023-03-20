import React from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { textPrimary, textSecondary } from '../../styles/js/shared';
import LongShort from '../layout/LongShort';

const MediaCardLargeFooterContent = ({
  title,
  body,
  inModal,
}) => {
  if (!body) return null;

  return (
    <div className="media-card-large-footer-content">
      <Typography variant="body1">
        <Box color={textSecondary}>
          {title}
        </Box>
        <Box color={textPrimary}>
          <LongShort showAll={inModal}>
            {body}
          </LongShort>
        </Box>
      </Typography>
    </div>
  );
};

export default MediaCardLargeFooterContent;
