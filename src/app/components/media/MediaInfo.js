import React, { Component } from 'react';

import Grid from '@material-ui/core/Grid';
import { Map } from '@meedan/check-ui';

class MediaInfo extends Component {
  render() {
    const { places = [], index = -1 } = this.props;

    return (
      <Grid container>
        <Grid item>
          <div style={{
            width: 560,
            height: 315
          }}>
            <Map places={places} index={index} />
          </div>
        </Grid>
      </Grid>
    )
  }
}

export default MediaInfo;