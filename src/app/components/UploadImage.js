import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import Dropzone from 'react-dropzone';
import MdHighlightRemove from 'react-icons/lib/md/highlight-remove';
import AboutRoute from '../relay/AboutRoute';

class UploadLabel extends Component {
  render() {
    const about = this.props.about;
    return (<span>Try dropping an image file here, or click to upload a file (max: {about.max_upload_size})</span>);
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
          <div><b>Image: </b>
            { this.state.file ? (`${this.state.file.name} (click or drop to change)`) : <UploadLabelRelay /> }
          </div>
        </Dropzone>

        <br />
      </div>
    );
  }
}

export default UploadImage;
