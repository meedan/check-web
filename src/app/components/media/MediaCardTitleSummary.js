import React from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

const MediaCardTitleSummary = ({
  title,
  summary,
}) => (
  <>
    <Box p={2}>
      { title ?
        <div>
          <Typography variant="subtitle2" className="media-card-large__title">
            {title}
          </Typography>
        </div> : null }
      { summary ?
        <div>
          <Typography variant="body1">
            {summary}
          </Typography>
        </div> : null }
    </Box>
  </>
);

export default MediaCardTitleSummary;
