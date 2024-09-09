import React from 'react';
import Box from '@material-ui/core/Box';

const MediaCardTitleSummary = ({
  style,
  summary,
  title,
}) => (
  <>
    <Box p={2} style={style}>
      { title ?
        <div className="typography-subtitle2 media-card-large__title">
          {title}
        </div> : null }
      { summary ?
        <div>
          {summary}
        </div> : null }
    </Box>
  </>
);

export default MediaCardTitleSummary;
