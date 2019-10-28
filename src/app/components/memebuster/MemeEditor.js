import React from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { FormattedMessage } from 'react-intl';
import { CirclePicker } from 'react-color';
import UploadImage from '../UploadImage';
import { mediaStatuses } from '../../customHelpers';
import { black54, caption, units } from '../../styles/js/shared';

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
    document.getElementById('remove-image').click();
    const image = this.props.media.media.picture;
    this.props.onParamChange({ image });
  }

  render() {
    const colors = mediaStatuses(this.props.media).statuses.map(s => s.style.color);

    return (
      <div style={{ fontFamily: 'Roboto', fontSize: 14, lineHeight: '1.5em' }}>
        <span style={{ font: caption, color: black54 }}><FormattedMessage id="memeEditor.image" defaultMessage="Image" /> *</span>
        <UploadImage onImage={this.handleImage} onClear={this.handleClearImage} type="image" />
        { this.props.media.media.picture ?
          <p>
            <Button onClick={this.handleDefaultImage.bind(this)}>
              <FormattedMessage
                id="memeEditor.useDefaultImage"
                defaultMessage="Use default image"
              />
            </Button>
          </p> : null
        }
        <TextField
          name="headline"
          label={<FormattedMessage id="memeEditor.headline" defaultMessage="Headline" />}
          onChange={this.handleChange}
          value={this.props.params.headline}
          margin="normal"
          fullWidth
          required
        />
        <TextField
          name="description"
          label={<FormattedMessage id="memeEditor.description" defaultMessage="Description" />}
          onChange={this.handleChange}
          value={this.props.params.description}
          margin="normal"
          fullWidth
          multiline
          required
        />
        <div>
          <TextField
            name="statusText"
            label={<FormattedMessage id="memeEditor.statusText" defaultMessage="Status label" />}
            onChange={this.handleChange}
            value={this.props.params.statusText}
            margin="normal"
            required
          />
        </div>
        <div>
          <TextField
            name="overlayColor"
            label={<FormattedMessage id="memeEditor.overlayColor" defaultMessage="Overlay color" />}
            onChange={this.handleChange}
            value={this.props.params.overlayColor}
            margin="normal"
            required
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
