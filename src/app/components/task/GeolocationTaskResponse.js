import React, { Component } from 'react';
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import { Map, Marker, TileLayer } from 'react-leaflet';
import styled from 'styled-components';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import ParsedText from '../ParsedText';
import { safelyParseJSON } from '../../helpers';
import { units, black05, black38, FlexRow } from '../../styles/js/shared';

const StyledMap = styled.div`
  height: 500px;
  width: 100%;
  .leaflet-container {
    min-height: 500px;
  }
`;

class GeolocationTaskResponse extends Component {
  constructor(props) {
    super(props);

    this.state = {
      zoomedMap: false,
    };
  }

  handleCloseMap() {
    this.setState({ zoomedMap: false });
  }

  handleOpenMap() {
    this.setState({ zoomedMap: true });
  }

  render() {
    if (!this.props.response) {
      return null;
    }

    const geoJSON = safelyParseJSON(this.props.response);
    const { properties: { name }, geometry: { coordinates } } = geoJSON;
    let coordinatesString = false;
    let imgPath = false;
    let position = [0, 0];
    if (coordinates[0] !== 0 || coordinates[1] !== 0) {
      position = [coordinates[0], coordinates[1]];
      coordinatesString = `${coordinates[0]}, ${coordinates[1]}`;
      imgPath = `https://api.mapbox.com/v4/mapbox.light/${coordinates[1]},${coordinates[0]},6/300x300@2x.png?access_token=${config.mapboxApiKey}`;
    }

    return (
      <FlexRow className="task__geolocation-response">
        <span className="task__response"><ParsedText text={name} /></span>
        {coordinatesString ?
          <Box
            component="span"
            className="task__geolocation"
            color={black38}
            px={1}
          >
            <a
              style={{ textDecoration: 'underline' }}
              href={`http://www.openstreetmap.org/?mlat=${coordinates[0]}&mlon=${coordinates[1]}&zoom=12#map=12/${coordinates[0]}/${coordinates[1]}`}
              target="_blank"
              rel="noreferrer noopener"
            >
              ({coordinatesString})
            </a>
          </Box>
          : null}
        {imgPath ?
          <Box // eslint-disable-line jsx-a11y/click-events-have-key-events
            component="span"
            border={`1px solid ${black05}`}
            ml="auto"
            className="task__geolocation-image"
            onClick={this.handleOpenMap.bind(this)}
          >
            <img
              style={{
                cursor: 'pointer',
                display: 'block',
                height: units(7),
                width: units(7),
              }}
              src={imgPath}
              alt=""
            />
          </Box>
          : null}
        {imgPath && !!this.state.zoomedMap ?
          <Dialog
            open={this.state.zoomedMap}
            onClose={this.handleCloseMap.bind(this)}
            maxWidth="md"
            fullWidth
          >
            <DialogContent>
              <StyledMap>
                <Map center={position} zoom={9}>
                  <TileLayer
                    attribution="2017 <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a>"
                    url="http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png"
                  />
                  <Marker draggable={false} position={position} />
                </Map>
              </StyledMap>
            </DialogContent>
          </Dialog>
          : null}
      </FlexRow>
    );
  }
}

export default GeolocationTaskResponse;
