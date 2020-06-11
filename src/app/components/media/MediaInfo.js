import React from 'react';

import Grid from '@material-ui/core/Grid';
import { Map } from '@meedan/check-ui';

const MediaInfo = ({ places = [], index = -1 }) => (
  <Grid container>
    <Grid item>
      <div style={{
        width: 560,
        height: 315,
      }}
      >
        <Map places={places} index={index} />
      </div>
    </Grid>
  </Grid>
);

export default MediaInfo;
