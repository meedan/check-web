/* eslint-disable no-shadow */
import React, { Component } from 'react';

import Grid from '@material-ui/core/Grid';
import { Map } from '@meedan/check-ui';

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

    return (
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
  }
}

export default MediaInfo;
