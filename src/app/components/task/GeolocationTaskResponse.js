import React, { Component, PropTypes } from 'react';
import Dialog from 'material-ui/Dialog';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';
import config from 'config';

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
    const geoJSON = JSON.parse(this.props.response);

    const name = geoJSON.properties.name;
    const coordinates = geoJSON.geometry.coordinates;
    let coordinatesString = false;
    let imgPath = false;
    let position = [0, 0];
    if (coordinates[0] != 0 || coordinates[1] != 0) {
      position = [coordinates[0], coordinates[1]];
      coordinatesString = `${coordinates[0]}, ${coordinates[1]}`;
      imgPath = `https://api.mapbox.com/v4/mapbox.emerald/${coordinates[1]},${coordinates[0]},6/300x300@2x.png?access_token=${config.mapboxApiKey}`;
    }

    return (
      <p className="task__geolocation-response">
        <span className="task__response">{name}</span>
        { coordinatesString ? <span className="task__note">{coordinatesString}</span> : null }
        { imgPath ? <span className="task__geolocation-image"><img src={imgPath} alt="" onClick={this.handleOpenMap.bind(this)} /></span> : null }
        { (imgPath && !!this.state.zoomedMap) ?
          <Dialog
            modal={false}
            open={this.state.zoomedMap}
            onRequestClose={this.handleCloseMap.bind(this)}>
            <div style={{ height: '500px', width: '100%' }}>
              <Map center={position} zoom="7">
                <TileLayer
                  attribution="2017 <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a>"
                  url="http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png"
                />
                <Marker
                  draggable={false}
                  position={position}
                >
                </Marker>
              </Map>
            </div>
          </Dialog>
        : null }
      </p>
    );
  }
}

export default GeolocationTaskResponse;
