import React from 'react';
import TextField from '@material-ui/core/TextField';
import { CirclePicker } from 'react-color';
import UploadImage from '../UploadImage';
import { mediaStatuses } from '../../customHelpers';
import { units } from '../../styles/js/shared';

class MemeEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleChange = (e) => {
    if (this.props.onParamChange) {
      const param = {};
      param[e.target.name] = e.target.value;
      this.props.onParamChange(param);
    }
  };

  handleColorSelect = (color) => {
    if (this.props.onParamChange) {
      this.props.onParamChange({ overlayColor: color.hex });
    }
  };

  handleImage = (image) => {
    if (this.props.onParamChange) {
      const param = { image };
      this.props.onParamChange(param);
    }
  };

  handleClearImage = () => {
    this.handleImage(null);
  };

  render() {
    const colors = mediaStatuses(this.props.media).statuses.map(s => s.style.color);

    return (
      <div>
        <UploadImage onImage={this.handleImage} onClear={this.handleClearImage} />
        <TextField
          name="headline"
          label="Headline"
          onChange={this.handleChange}
          value={this.props.params.headline}
          margin="normal"
          fullWidth
        />
        <TextField
          name="description"
          label="Description"
          onChange={this.handleChange}
          value={this.props.params.description}
          margin="normal"
          fullWidth
          multiline
        />
        <TextField
          name="statusText"
          label="Status Text"
          onChange={this.handleChange}
          value={this.props.params.statusText}
          margin="normal"
        />
        <TextField
          name="overlayColor"
          label="Overlay color"
          onChange={this.handleChange}
          value={this.props.params.overlayColor}
          margin="normal"
        />
        <div style={{ marginBottom: units(2) }}>
          <CirclePicker onChangeComplete={this.handleColorSelect} colors={colors} />
        </div>
      </div>
    );
  }
}

export default MemeEditor;
