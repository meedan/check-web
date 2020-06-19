/* eslint-disable no-shadow */
import React, { Component } from 'react';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { Map } from '@meedan/check-ui';
import { withStyles } from '@material-ui/core/styles';

class MediaInfo extends Component {
  static getDerivedStateFromProps({
    media: {
      geolocations: { edges: locations = [] },
    },
    time,
  }) {
    const places = locations.filter(({ node: { id } }) => !!id).map(({
      node, node: { id, parsed_fragment: { t: [start_seconds, end_seconds] }, content },
    }) => {
      const {
        geolocation_viewport: { viewport, zoom = 10 },
        geolocation_location,
      } = JSON.parse(content).reduce((acc, { field_name, value_json }) =>
        ({ ...acc, [field_name]: value_json }), {});

      const {
        properties: { name = id.trim() } = {},
        geometry: { type = 'Point', coordinates = [0, 0] } = {},
      } = geolocation_location;
      const [lng, lat] = coordinates;

      const place = {
        id: `place-${name}`,
        name,
        viewport,
        zoom,
        lat,
        lng,
        type: type === 'Point' ? 'marker' : 'polygon',
        test: { geolocation_location },
        project_place: { id: `place-${name}`, name },
        start_seconds,
        end_seconds,
        node,
      };

      if (type === 'Polygon') {
        place.polygon = coordinates[0].map(([lng, lat]) => ({ lat, lng }));
      }

      return place;
    });

    const index = places.findIndex(({ start_seconds, end_seconds }) =>
      start_seconds <= time && time < end_seconds);

    return { places, index };
  }

  render() {
    const { places = [], index = -1 } = this.state;
    const { classes } = this.props;

    return (
      <Grid className={classes.gridContainer} container>
        <Grid className={classes.gridItem} item>
          <Typography color="textSecondary" component="h2" gutterBottom variant="subtitle1">Location</Typography>
          <div className={classes.mapWrap}>
            <Map places={places} index={index} />
          </div>
        </Grid>
      </Grid>
    );
  }
}

const mediaInfoStyles = {
  gridContainer: {
    width: '100%',
    height: '100%',
  },
  gridItem: {
    width: '100%',
  },
  mapWrap: {
    minHeight: '260px',
    width: '100%',
    height: '100%',
  },
};

export default withStyles(mediaInfoStyles)(MediaInfo);
