import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import Dropzone from 'react-dropzone';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import MdHighlightRemove from 'react-icons/lib/md/highlight-remove';
import AboutRoute from '../relay/AboutRoute';
import { unhumanizeSize } from '../helpers';

const messages = defineMessages({
  changeFile: {
    id: 'uploadImage.changeFile',
    defaultMessage: '{filename} (click or drop to change)',
  },
  invalidExtension: {
    id: 'uploadImage.invalidExtension',
    defaultMessage: 'Validation failed: File cannot have type "{extension}", allowed types: {allowed_types}',
  },
  fileTooLarge: {
    id: 'uploadImage.fileTooLarge',
    defaultMessage: 'Validation failed: File size should be less than {size}',
  }
});

class UploadImageComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { file: null };
  }

  onDrop(files) {
    const file = files[0];
    const valid_extensions = this.props.about.upload_extensions.toLowerCase().split(/[\s,]+/);
    const extension = file.name.substr(file.name.lastIndexOf('.')+1).toLowerCase();
    if (valid_extensions.length > 0 && valid_extensions.indexOf(extension) < 0) {
      if (this.props.onError) {
        this.props.onError(file, this.props.intl.formatMessage(messages.invalidExtension, { extension, allowed_types: this.props.about.upload_extensions }));
      }
      return;
    }
    if (file.size && unhumanizeSize(this.props.about.upload_max_size) < file.size) {
      if (this.props.onError) {
        this.props.onError(file, this.props.intl.formatMessage(messages.fileTooLarge, { size: this.props.about.upload_max_size }));
      }
      return;
    }

    this.props.onImage(file);
    this.setState({ file });
  }

  onDelete() {
    if (this.props.onClear) { this.props.onClear(); }
    this.setState({ file: null });
  }

  preview() {
    let style = {};
    if (this.state.file) {
      style = { backgroundImage: `url(${this.state.file.preview})` };
    }

    if (this.state.file && this.props.noPreview) {
      return (
        <span className="no-preview"><MdHighlightRemove className="remove-image" onClick={this.onDelete.bind(this)} /></span>
      );
    } else if (this.state.file) {
      return (
        <span className="preview" style={style}><MdHighlightRemove className="remove-image" onClick={this.onDelete.bind(this)} /></span>
      );
    }
  }

  render() {
    const about = this.props.about;

    return (
      <div className="upload-file">
        { this.preview() }
        <Dropzone onDrop={this.onDrop.bind(this)} multiple={false} className={this.state.file ? 'with-file' : 'without-file'}>
          <div>
            { this.state.file ?
              this.props.intl.formatMessage(messages.changeFile, { filename: this.state.file.name }) :
              <FormattedMessage id="uploadImage.message"
                defaultMessage="Drop an image file here, or click to upload a file (max size: {upload_max_size}, allowed extensions: {upload_extensions}, allowed dimensions between {upload_min_dimensions} and {upload_max_dimensions} pixels)"
                        values={{
                          upload_max_size: about.upload_max_size,
                          upload_extensions: about.upload_extensions,
                          upload_max_dimensions: about.upload_max_dimensions,
                          upload_min_dimensions: about.upload_min_dimensions
                        }}
              />
            }
          </div>
        </Dropzone>
        <br />
      </div>
    );
  }
}

UploadImageComponent.propTypes = {
  intl: intlShape.isRequired,
};

const UploadImageContainer = Relay.createContainer(injectIntl(UploadImageComponent), {
  fragments: {
    about: () => Relay.QL`
      fragment on About {
        upload_max_size,
        upload_extensions,
        upload_max_dimensions,
        upload_min_dimensions
      }
    `,
  },
});

class UploadImage extends Component {
  render() {
    const route = new AboutRoute();
    return (<Relay.RootContainer Component={UploadImageContainer} route={route} renderFetched={data => <UploadImageContainer {...this.props} {...data} /> } />);
  }
}

export default UploadImage;
