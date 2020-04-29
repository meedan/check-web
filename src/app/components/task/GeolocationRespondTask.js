import React, { Component } from 'react';
import AutoComplete from 'material-ui/AutoComplete';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl';
import { Map, Marker, TileLayer } from 'react-leaflet';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import { black54, caption } from '../../styles/js/shared';
import { stringHelper } from '../../customHelpers';

const messages = defineMessages({
  searching: {
    id: 'geoLocationRespondTask.searching',
    defaultMessage: 'Searching...',
  },
  notFound: {
    id: 'geoLocationRespondTask.notFound',
    defaultMessage: 'Sorry, this place was not found. Please try another search.',
  },
  error: {
    id: 'geoLocationRespondTask.error',
    defaultMessage: 'Sorry, an error occurred while updating the task. Please try again and contact {supportEmail} if the condition persists.',
  },
  placeName: {
    id: 'geolocationRespondTask.placeName',
    defaultMessage: 'Customize place name',
  },
  coordinates: {
    id: 'geolocationRespondTask.coordinates',
    defaultMessage: 'Latitude, Longitude',
  },
});

class GeolocationRespondTask extends Component {
  constructor(props) {
    super(props);

    const { response } = this.props;
    let name = '';
    let coordinatesString = '';
    let lat = 0;
    let lng = 0;
    if (response) {
      const geoJSON = JSON.parse(this.props.response);
      ({ name } = geoJSON.properties);
      const { coordinates } = geoJSON.geometry;
      if (coordinates[0] || coordinates[1]) {
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
      searchResult: [],
    };

    this.timer = null;
  }

  componentDidMount() {
    this.reloadMap();
  }

  componentDidUpdate() {
    this.reloadMap();
  }

  getCoordinates() {
    let coordinates = [0, 0];
    try {
      const { coordinatesString } = this.state;
      if (coordinatesString && coordinatesString !== '') {
        const pair = coordinatesString.split(/, ?/);
        coordinates = [parseFloat(pair[0]), parseFloat(pair[1])];
      }
    } catch (e) {
      coordinates = [0, 0];
    }
    return coordinates;
  }

  setTaskAnswerDisabled = () => {
    const taskAnswerDisabled = !this.canSubmit();
    this.setState({ taskAnswerDisabled });
  };

  canSubmit() {
    return this.state.name && this.state.name.trim();
  }

  toggleDraggable() {
    this.setState({ draggable: !this.state.draggable });
  }

  updatePosition() {
    const { lat, lng } = this.marker.leafletElement.getLatLng();
    // eslint-disable-next-line no-underscore-dangle
    const zoom = this.marker.leafletElement._map.getZoom();
    const coordinatesString = `${parseFloat(lat).toFixed(7)}, ${parseFloat(lng).toFixed(7)}`;
    this.setState({
      lat, lng, zoom, coordinatesString, focus: true,
    });
  }

  updatePositionOnClick(e) {
    const { lat, lng } = e.latlng;
    // eslint-disable-next-line no-underscore-dangle
    const zoom = this.marker.leafletElement._map.getZoom();
    const coordinatesString = `${parseFloat(lat).toFixed(7)}, ${parseFloat(lng).toFixed(7)}`;
    this.setState({
      lat, lng, zoom, coordinatesString, focus: true, message: '',
    });
    this.autoComplete.setState({ searchText: '' });
  }

  handlePressButton() {
    if (this.canSubmit()) {
      this.handleSubmit();
    }
  }

  handleChange(e) {
    this.setState({
      name: e.target.value,
      message: '',
    }, this.setTaskAnswerDisabled);
  }

  handleSearchText(query) {
    const keystrokeWait = 1000;

    this.setState({ message: '' });

    clearTimeout(this.timer);

    if (query) {
      this.setState({ message: this.props.intl.formatMessage(messages.searching) });
      this.timer = setTimeout(() => this.geoCodeQueryOpenCage(query), keystrokeWait);
    }
  }

  handleChangeCoordinates(e) {
    this.setState({
      coordinatesString: e.target.value,
    }, this.setTaskAnswerDisabled);

    const keystrokeWait = 1000;

    this.setState({ message: '' });

    clearTimeout(this.timer);

    if (e.target.value) {
      this.autoComplete.setState({ searchText: '' });
      this.timer = setTimeout(() => this.handleBlur(), keystrokeWait);
    }
  }

  handleBlur() {
    const coordinates = this.getCoordinates();
    this.setState({
      lat: coordinates[0],
      lng: coordinates[1],
    }, this.setTaskAnswerDisabled);
    this.autoComplete.setState({ searchText: '' });
  }

  handleSubmit() {
    if (!this.state.taskAnswerDisabled) {
      const name = this.state.name.trim();
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

  reloadMap() {
    if (this.marker && this.marker.leafletElement) {
      // eslint-disable-next-line no-underscore-dangle
      this.marker.leafletElement._map.invalidateSize();
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
      message: '',
    });
    if (this.props.onDismiss) {
      this.props.onDismiss();
    }
    this.autoComplete.setState({ searchText: '' });
  }

  // eslint-disable-next-line class-methods-use-this
  handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
    }
  }

  geoCodeQueryOpenCage = (query) => {
    const apiKey = config.opencageApiKey;
    const providerUrl = `https://api.opencagedata.com/geocode/v1/json?key=${apiKey}&q=${query}&no_annotations=1`;

    fetch(providerUrl)
      .then((response) => {
        if (!response.ok) {
          throw Error(this.props.intl.formatMessage(messages.error, { supportEmail: stringHelper('SUPPORT_EMAIL') }));
        }
        return response.json();
      })
      .then((response) => {
        const searchResult = response.results || [];
        let message = '';
        if (!searchResult.length) {
          message = this.props.intl.formatMessage(messages.notFound);
        }
        this.setState({ searchResult, message });
      })
      .catch(error => this.setState({ message: error.message }));
  };

  render() {
    const position = [this.state.lat, this.state.lng];

    const actionBtns = (
      <p className="task__resolver">
        <Button
          className="task__cancel"
          onClick={this.handleCancel.bind(this)}
        >
          <FormattedMessage id="geolocationRespondTask.cancelTask" defaultMessage="Cancel" />
        </Button>
        <Button
          disabled={this.state.taskAnswerDisabled}
          className="task__save"
          color="primary"
          onClick={this.handlePressButton.bind(this)}
        >
          <FormattedMessage
            id="geolocationRespondTask.answerTask"
            defaultMessage="Answer task"
          />
        </Button>
      </p>
    );

    const selectCallback = (obj) => {
      if (typeof obj === 'object') {
        const { lat, lng } = obj.geometry;
        this.setState(
          {
            name: obj.formatted,
            coordinatesString: `${lat}, ${lng}`,
          },
          this.handleBlur,
        );
      }
    };

    const dataSourceConfig = {
      text: 'formatted',
      value: 'geometry',
    };

    return (
      <div>
        <AutoComplete
          id="geolocationsearch"
          floatingLabelText={
            <FormattedMessage
              id="geolocationRespondTask.searchMap"
              defaultMessage="Search the map"
            />
          }
          name="geolocationsearch"
          dataSource={this.state.searchResult}
          dataSourceConfig={dataSourceConfig}
          filter={AutoComplete.noFilter}
          onFocus={() => { this.setState({ focus: true }); }}
          onKeyPress={this.handleKeyPress.bind(this)}
          onNewRequest={selectCallback}
          ref={(a) => { this.autoComplete = a; }}
          onUpdateInput={this.handleSearchText.bind(this)}
          menuProps={{ className: 'task__response-geolocation-search-options' }}
          fullWidth
        />
        <div style={{ font: caption, color: black54 }}>
          {this.state.message }
        </div>
        <TextField
          id="task__response-geolocation-name"
          className="task__response-input"
          label={this.props.intl.formatMessage(messages.placeName)}
          name="response"
          value={this.state.name}
          onChange={this.handleChange.bind(this)}
          onFocus={() => { this.setState({ focus: true }); }}
          fullWidth
          multiline
          margin="normal"
        />
        <TextField
          id="task__response-geolocation-coordinates"
          className="task__response-coordinates-input"
          label={this.props.intl.formatMessage(messages.coordinates)}
          name="coordinates"
          onChange={this.handleChangeCoordinates.bind(this)}
          onFocus={() => { this.setState({ focus: true }); }}
          onBlur={this.handleBlur.bind(this)}
          value={this.state.coordinatesString}
          fullWidth
          margin="normal"
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
              ref={(m) => { this.marker = m; }}
            />
          </Map>
        </div>
        { this.state.focus || this.props.response ? actionBtns : null }
      </div>
    );
  }
}

export default injectIntl(GeolocationRespondTask);
