import React from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

const MediaCardTitleSummary = ({
  title,
  summary,
}) => (
  <>
    <Box p={2}>
      <div>
        <Typography variant="subtitle2">
          {title}
        </Typography>
      </div>
      <div>
        <Typography variant="body1">
          {summary}
        </Typography>
      </div>
    </Box>
  </>
);

export default MediaCardTitleSummary;
