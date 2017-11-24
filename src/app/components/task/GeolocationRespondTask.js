import React, { Component, PropTypes } from 'react';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';

class GeolocationRespondTask extends Component {
  constructor(props) {
    super(props);

    let name = '';
    let coordinatesString = '';
    let lat = 0;
    let lng = 0;

    const response = this.props.response;

    if (response) {
      const geoJSON = JSON.parse(this.props.response);
      name = geoJSON.properties.name;
      const coordinates = geoJSON.geometry.coordinates;
      if (coordinates[0] != 0 || coordinates[1] != 0) {
        lat = parseFloat(coordinates[0]).toFixed(7);
        lng = parseFloat(coordinates[1]).toFixed(7);
        coordinatesString = `${lat}, ${lng}`;
      }
    }

    this.state = {
      taskAnswerDisabled: true,
      zoom: 5,
      draggable: true,
      lat,
      lng,
      name,
      coordinatesString,
      original: {
        lat,
        lng,
        name,
        coordinatesString,
      },
    };
  }

  toggleDraggable() {
    this.setState({ draggable: !this.state.draggable });
  }

  updatePosition() {
    const { lat, lng } = this.refs.marker.leafletElement.getLatLng();
    const zoom = this.refs.marker.leafletElement._map.getZoom();
    const coordinatesString = `${parseFloat(lat).toFixed(7)}, ${parseFloat(lng).toFixed(7)}`;
    this.setState({ lat, lng, zoom, coordinatesString, focus: true });
  }

  updatePositionOnClick(e) {
    const { lat, lng } = e.latlng;
    const zoom = this.refs.marker.leafletElement._map.getZoom();
    const coordinatesString = `${parseFloat(lat).toFixed(7)}, ${parseFloat(lng).toFixed(7)}`;
    this.setState({ lat, lng, zoom, coordinatesString, focus: true });
  }

  canSubmit() {
    const value = document.getElementById('task__response-geolocation-name').value;
    if (typeof value !== 'undefined' && value !== null) {
      return !!value.trim();
    }
    return false;
  }

  handlePressButton() {
    if (this.canSubmit()) {
      this.handleSubmit();
    }
  }

  handleChange(e) {
    this.setState({ taskAnswerDisabled: !this.canSubmit(), name: e.target.value });
  }

  handleChangeCoordinates(e) {
    this.setState({ taskAnswerDisabled: !this.canSubmit(), coordinatesString: e.target.value });
  }

  handleBlur() {
    const coordinates = this.getCoordinates();
    this.setState({ lat: coordinates[0], lng: coordinates[1] });
  }

  getCoordinates() {
    let coordinates = [0, 0];
    try {
      const coordinatesString = this.state.coordinatesString;
      if (coordinatesString && coordinatesString !== '') {
        const pair = coordinatesString.split(/, ?/);
        coordinates = [parseFloat(pair[0]), parseFloat(pair[1])];
      }
    } catch (e) {
      coordinates = [0, 0];
    }
    return coordinates;
  }

  handleSubmit() {
    if (!this.state.taskAnswerDisabled) {
      const name = document.getElementById('task__response-geolocation-name').value;
      const coordinates = this.getCoordinates();

      const response = JSON.stringify({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates,
        },
        properties: {
          name,
        },
      });

      this.setState({ taskAnswerDisabled: true });
      this.props.onSubmit(response, false);
    }
  }

  componentDidUpdate() {
    this.reloadMap();
  }

  componentDidMount() {
    this.reloadMap();
  }

  reloadMap() {
    if (this.refs.marker && this.refs.marker.leafletElement) {
      this.refs.marker.leafletElement._map.invalidateSize();
    }
  }

  handleCancel() {
    const ori = this.state.original;
    this.setState({
      focus: false,
      name: ori.name,
      lat: ori.lat,
      lng: ori.lng,
      coordinatesString: ori.coordinatesString,
    });
    if (this.props.onDismiss) {
      this.props.onDismiss();
    }
  }

  render() {
    const position = [this.state.lat, this.state.lng];

    const actionBtns = (
      <p className="task__resolver">
        <FlatButton
          className="task__cancel"
          label={
            <FormattedMessage id="geolocationRespondTask.cancelTask" defaultMessage="Cancel" />
          }
          onClick={this.handleCancel.bind(this)}
        />
        <FlatButton
          disabled={this.state.taskAnswerDisabled}
          className="task__save"
          label={
            <FormattedMessage
              id="geolocationRespondTask.resolveTask"
              defaultMessage="Resolve task"
            />
          }
          primary
          onClick={this.handlePressButton.bind(this)}
        />
      </p>
    );

    return (
      <div>
        <TextField
          id="task__response-geolocation-name"
          className="task__response-input"
          floatingLabelText={
            <FormattedMessage
              id="geolocationRespondTask.placeName"
              defaultMessage="Type the name of the location"
            />
          }
          name="response"
          value={this.state.name}
          onChange={this.handleChange.bind(this)}
          onFocus={() => { this.setState({ focus: true }); }}
          fullWidth
          multiLine
        />
        <TextField
          id="task__response-geolocation-coordinates"
          className="task__response-note-input"
          floatingLabelText={
            <FormattedMessage
              id="geolocationRespondTask.coordinates"
              defaultMessage="Latitude, Longitude"
            />
          }
          name="coordinates"
          onChange={this.handleChangeCoordinates.bind(this)}
          onFocus={() => { this.setState({ focus: true }); }}
          onBlur={this.handleBlur.bind(this)}
          value={this.state.coordinatesString}
          fullWidth
          multiLine
        />
        <div>
          <Map
            style={{ height: '400px' }}
            center={position}
            zoom={this.state.zoom}
            onClick={this.updatePositionOnClick.bind(this)}
          >
            <TileLayer
              attribution="2017 <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a>"
              url="http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png"
            />
            <Marker
              draggable={this.state.draggable}
              onDragend={this.updatePosition.bind(this)}
              position={position}
              ref="marker"
            />
          </Map>
        </div>
        { this.state.focus || this.props.response ? actionBtns : null }
      </div>
    );
  }
}

GeolocationRespondTask.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(GeolocationRespondTask);
