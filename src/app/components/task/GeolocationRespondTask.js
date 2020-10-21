import React, { Component } from "react";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { FormattedMessage } from "react-intl";
import { Map, Marker, TileLayer } from "react-leaflet";
import CoordinateParser from "coordinate-parser";
import config from "config"; // eslint-disable-line require-path-exists/exists
import { black54, caption } from "../../styles/js/shared";
import { stringHelper } from "../../customHelpers";
import { FormattedGlobalMessage } from "../MappedMessage";
import styled from "styled-components";

class GeolocationRespondTask extends Component {
  constructor(props) {
    super(props);

    const { response } = this.props;
    let name = "";
    let coordinatesString = "";
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
      openResultsPopup: false,
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
    const { coordinatesString } = this.state;
    let coordinates = [0, 0];
    try {
      const pos = new CoordinateParser(coordinatesString);
      coordinates = [pos.getLatitude(), pos.getLongitude()];
    } catch (e) {
      coordinates = [0, 0];
      this.setState({
        coordMessage: (
          <FormattedMessage
            id="geoLocationRespondTask.invalidCoords"
            defaultMessage="Invalid coordinates"
          />
        ),
      });
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
    const coordinatesString = `${parseFloat(lat).toFixed(7)}, ${parseFloat(
      lng
    ).toFixed(7)}`;
    this.setState({
      lat,
      lng,
      zoom,
      coordinatesString,
      focus: true,
      message: "",
      coordMessage: "",
    });
  }

  updatePositionOnClick(e) {
    const { lat, lng } = e.latlng;
    // eslint-disable-next-line no-underscore-dangle
    const zoom = this.marker.leafletElement._map.getZoom();
    const coordinatesString = `${parseFloat(lat).toFixed(7)}, ${parseFloat(
      lng
    ).toFixed(7)}`;
    this.setState({
      lat,
      lng,
      zoom,
      coordinatesString,
      focus: true,
      message: "",
      coordMessage: "",
    });
  }

  handlePressButton() {
    if (this.canSubmit()) {
      this.handleSubmit();
    }
  }

  handleChange(e) {
    this.setState(
      {
        name: e.target.value,
        message: "",
      },
      this.setTaskAnswerDisabled
    );
  }

  handleSearchText(e) {
    const query = e.target.value;
    const keystrokeWait = 1000;

    this.setState({ message: "" });
    clearTimeout(this.timer);

    if (query) {
      this.setState({
        message: (
          <FormattedMessage
            id="geoLocationRespondTask.searching"
            defaultMessage="Searching…"
          />
        ),
      });
      this.timer = setTimeout(
        () => this.geoCodeQueryOpenCage(query),
        keystrokeWait
      );
    }
  }

  handleChangeCoordinates(e) {
    this.setState(
      {
        coordinatesString: e.target.value,
        coordMessage: "",
      },
      this.setTaskAnswerDisabled
    );

    const keystrokeWait = 1000;

    this.setState({ message: "" });

    clearTimeout(this.timer);

    if (e.target.value) {
      this.timer = setTimeout(() => this.handleBlur(), keystrokeWait);
    }
  }

  handleBlur() {
    const coordinates = this.getCoordinates();
    this.setState(
      {
        lat: coordinates[0],
        lng: coordinates[1],
      },
      this.setTaskAnswerDisabled
    );
  }

  handleSubmit() {
    if (!this.state.taskAnswerDisabled) {
      const name = this.state.name.trim();
      const coordinates = this.getCoordinates();

      const response = JSON.stringify({
        type: "Feature",
        geometry: {
          type: "Point",
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
      message: "",
    });
    if (this.props.onDismiss) {
      this.props.onDismiss();
    }
  }

  // eslint-disable-next-line class-methods-use-this
  handleKeyPress(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
    }
  }

  async geoCodeQueryOpenCage(query) {
    const apiKey = config.opencageApiKey;
    const providerUrl = `https://api.opencagedata.com/geocode/v1/json?key=${apiKey}&q=${query}&no_annotations=1`;

    let response;
    try {
      response = await fetch(providerUrl); // may throw

      if (!response.ok) {
        this.setState({
          message: (
            <FormattedMessage
              id="geoLocationRespondTask.error"
              defaultMessage="Sorry, an error occurred while updating the task. Please try again and contact {supportEmail} if the condition persists."
              values={{ supportEmail: stringHelper("SUPPORT_EMAIL") }}
            />
          ),
        });
        return;
      }

      response = await response.json(); // may throw
      const searchResult = response.results || []; // may throw if response === null

      let message = null;
      if (!searchResult.length) {
        message = (
          <FormattedMessage
            id="geoLocationRespondTask.notFound"
            defaultMessage="Sorry, this place was not found. Please try another search."
          />
        );
      }
      this.setState({
        searchResult,
        message,
        openResultsPopup: Boolean(searchResult.length),
      });
    } catch (error) {
      this.setState({
        message: <span className="TODO-help-the-user">{error.message}</span>,
      });
    }
  }

  render() {
    const { fieldset } = this.props;
    const position = [this.state.lat, this.state.lng];

    const actionBtns = (
      <p className="task__resolver">
        <Button className="task__cancel" onClick={this.handleCancel.bind(this)}>
          <FormattedMessage
            id="geolocationRespondTask.cancelTask"
            defaultMessage="Cancel"
          />
        </Button>
        <Button
          disabled={this.state.taskAnswerDisabled}
          className="task__save"
          color="primary"
          onClick={this.handlePressButton.bind(this)}
        >
          {fieldset === "tasks" ? (
            <FormattedMessage
              id="geolocationRespondTask.answerTask"
              defaultMessage="Answer task"
            />
          ) : (
            <FormattedGlobalMessage messageKey="save" />
          )}
        </Button>
      </p>
    );

    const selectCallback = (e, obj) => {
      if (typeof obj === "object") {
        const { lat, lng } = obj.geometry;
        this.setState(
          {
            name: obj.formatted,
            coordinatesString: `${lat}, ${lng}`,
            openResultsPopup: false,
          },
          this.handleBlur
        );
      }
    };

    const CustomMap = styled(Map)`
      height: 400px;
    `;

    const CustomMessageDisplayer = styled.div`
      font: ${caption};
      color: ${black54};
    `;

    return (
      <div>
        <Autocomplete
          id="geolocationsearch"
          name="geolocationsearch"
          options={this.state.searchResult}
          open={this.state.openResultsPopup}
          getOptionLabel={(option) => option.formatted}
          renderInput={(params) => (
            <TextField
              label={
                <FormattedMessage
                  id="geolocationRespondTask.searchMap"
                  defaultMessage="Search the map"
                />
              }
              onKeyPress={this.handleKeyPress.bind(this)}
              onChange={this.handleSearchText.bind(this)}
              {...params}
            />
          )}
          onChange={selectCallback}
          onBlur={() => this.setState({ openResultsPopup: false })}
          fullWidth
        />
        <CustomMessageDisplayer>{this.state.message}</CustomMessageDisplayer>
        <TextField
          id="task__response-geolocation-name"
          className="task__response-input"
          label={
            <FormattedMessage
              id="geolocationRespondTask.placeName"
              defaultMessage="Customize place name"
            />
          }
          name="response"
          value={this.state.name}
          onChange={this.handleChange.bind(this)}
          onFocus={() => {
            this.setState({ focus: true });
          }}
          fullWidth
          multiline
          margin="normal"
        />
        <TextField
          id="task__response-geolocation-coordinates"
          className="task__response-coordinates-input"
          label={
            <FormattedMessage
              id="geolocationRespondTask.coordinates"
              defaultMessage="Latitude, Longitude"
            />
          }
          name="coordinates"
          onChange={this.handleChangeCoordinates.bind(this)}
          onFocus={() => {
            this.setState({ focus: true });
          }}
          onBlur={this.handleBlur.bind(this)}
          value={this.state.coordinatesString}
          error={!!this.state.coordMessage}
          helperText={this.state.coordMessage}
          fullWidth
          margin="normal"
        />
        <div>
          <CustomMap
            center={position}
            zoom={this.state.zoom}
            onClick={this.updatePositionOnClick.bind(this)}
          >
            <TileLayer
              attribution='2017 <a href="http://osm.org/copyright">OpenStreetMap</a>'
              url="http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png"
            />
            <Marker
              draggable={this.state.draggable}
              onDragend={this.updatePosition.bind(this)}
              position={position}
              ref={(m) => {
                this.marker = m;
              }}
            />
          </CustomMap>
        </div>
        {this.state.focus || this.props.response ? actionBtns : null}
      </div>
    );
  }
}

export default GeolocationRespondTask;
