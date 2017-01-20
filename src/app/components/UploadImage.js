import React, { Component, PropTypes } from 'react';
import Dropzone from 'react-dropzone';
import FontAwesome from 'react-fontawesome';

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
        { this.state.file ? <span className="preview" style={style}><FontAwesome name="remove" className="remove-image" onClick={this.onDelete.bind(this)} /></span> : null }

        <Dropzone onDrop={this.onDrop.bind(this)} multiple={false} className={this.state.file ? 'with-file' : 'without-file'}>
          <div><b>Image: </b>
            { this.state.file ? (`${this.state.file.name} (click or drop to change)`) : 'Try dropping an image file here, or click to upload a file' }
          </div>
        </Dropzone>

        <br />
      </div>
    );
  }
}

export default UploadImage;
