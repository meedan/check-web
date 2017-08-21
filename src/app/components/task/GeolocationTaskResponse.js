import React, { Component, PropTypes } from 'react';
import Lightbox from 'react-image-lightbox';
import config from 'config';

class GeolocationTaskResponse extends Component {
  constructor(props) {
    super(props);

    this.state = {
      zoomedMapImage: false
    };
  }

  handleCloseMapImage() {
    this.setState({ zoomedMapImage: false });
  }

  handleOpenMapImage(image) {
    this.setState({ zoomedMapImage: image });
  }

  render() {
    const geoJSON = JSON.parse(this.props.response);

    const name = geoJSON.properties.name;
    const coordinates = geoJSON.geometry.coordinates;
    let coordinatesString = false;
    let imgPath = false;
    if (coordinates[0] != 0 || coordinates[1] != 0) {
      coordinatesString = `${coordinates[0]}, ${coordinates[1]}`;
      imgPath = `https://api.mapbox.com/v4/mapbox.emerald/${coordinates[1]},${coordinates[0]},6/300x300@2x.png?access_token=${config.mapboxApiKey}`;
    }

    return (
      <p className="task__geolocation-response">
        <span className="task__response">{name}</span>
        { coordinatesString ? <span className="task__note">{coordinatesString}</span> : null }
        { imgPath ? <span className="task__geolocation-image"><img src={imgPath} alt="" onClick={this.handleOpenMapImage.bind(this, imgPath)} /></span> : null }
        { (imgPath && !!this.state.zoomedMapImage) ?
          <Lightbox onCloseRequest={this.handleCloseMapImage.bind(this)} mainSrc={this.state.zoomedMapImage} />
        : null }
      </p>
    );
  }
}

export default GeolocationTaskResponse;
