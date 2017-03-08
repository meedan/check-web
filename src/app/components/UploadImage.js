import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import Dropzone from 'react-dropzone';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import MdHighlightRemove from 'react-icons/lib/md/highlight-remove';
import AboutRoute from '../relay/AboutRoute';

const messages = defineMessages({
  changeFile: {
    id: 'uploadImage.changeFile',
    defaultMessage: '{filename} (click or drop to change)',
  },
  imageLabel: {
    id: 'uploadImage.imageLabel',
    defaultMessage: 'Image:',
  },

});
class UploadLabel extends Component {
  render() {
    const about = this.props.about;
    return (
      <FormattedMessage
        id="uploadLabel.message"
        defaultMessage="Try dropping an image file here, or click to upload a file (max: {max_upload_size})"
        values={{ max_upload_size: about.max_upload_size }}
      />
    );
  }
}

const UploadLabelContainer = Relay.createContainer(UploadLabel, {
  fragments: {
    about: () => Relay.QL`
      fragment on About {
        max_upload_size
      }
    `,
  },
});

class UploadLabelRelay extends Component {
  render() {
    const route = new AboutRoute();
    return (<Relay.RootContainer Component={UploadLabelContainer} route={route} />);
  }
}

class UploadImage extends Component {
  constructor(props) {
    super(props);
    this.state = { file: null };
  }

  onDrop(files) {
    const file = files[0];
    this.props.onImage(file);
    this.setState({ file });
  }

  onDelete() {
    this.setState({ file: null });
  }

  render() {
    let style = {};
    if (this.state.file) {
      style = { backgroundImage: `url(${this.state.file.preview})` };
    }

    return (
      <div className="upload-file">
        { this.state.file ? <span className="preview" style={style}><MdHighlightRemove className="remove-image" onClick={this.onDelete.bind(this)} /></span> : null }

        <Dropzone onDrop={this.onDrop.bind(this)} multiple={false} className={this.state.file ? 'with-file' : 'without-file'}>
          <div><b>{this.props.intl.formatMessage(messages.imageLabel)}&nbsp;</b>
            { this.state.file ? this.props.intl.formatMessage(messages.changeFile, { filename: this.state.file.name }) : <UploadLabelRelay /> }
          </div>
        </Dropzone>

        <br />
      </div>
    );
  }
}

UploadImage.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(UploadImage);
