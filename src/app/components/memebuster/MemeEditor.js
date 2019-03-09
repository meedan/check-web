import React from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { FormattedMessage } from 'react-intl';
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

  handleDefaultImage() {
    const image = this.props.media.media.picture;
    this.props.onParamChange({ image });
  }

  render() {
    const colors = mediaStatuses(this.props.media).statuses.map(s => s.style.color);

    return (
      <div style={{ fontFamily: 'Roboto', fontSize: 14, lineHeight: '1.5em' }}>
        <UploadImage onImage={this.handleImage} onClear={this.handleClearImage} />
        <p>
          <Button onClick={this.handleDefaultImage.bind(this)}>
            <FormattedMessage
              id="memeEditor.useDefaultImage"
              defaultMessage="Use default image"
            />
          </Button>
        </p>
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
        <div>
          <TextField
            name="statusText"
            label="Status Text"
            onChange={this.handleChange}
            value={this.props.params.statusText}
            margin="normal"
          />
        </div>
        <div>
          <TextField
            name="overlayColor"
            label="Overlay color"
            onChange={this.handleChange}
            value={this.props.params.overlayColor}
            margin="normal"
          />
        </div>
        <div style={{ marginBottom: units(2) }}>
          <CirclePicker onChangeComplete={this.handleColorSelect} colors={colors} />
        </div>
      </div>
    );
  }
}

export default MemeEditor;
