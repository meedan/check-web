import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Dropzone from 'react-dropzone';
import { FormattedMessage } from 'react-intl';
import MdHighlightRemove from 'react-icons/lib/md/highlight-remove';
import styled from 'styled-components';
import CircularProgress from './CircularProgress';
import { unhumanizeSize } from '../helpers';
import {
  black38,
  Row,
  units,
  borderWidthMedium,
  StyledIconButton,
} from '../styles/js/shared';

const previewSize = units(10);

const StyledUploader = styled.div`
    display: flex;
    margin: ${units(1)} 0 ${units(2)};
    align-items: center;

    .with-file,
    .without-file {
      align-items: center;
      border: ${borderWidthMedium} dashed ${black38};
      color: ${black38};
      cursor: pointer;
      display: flex;
      height: auto;
      justify-content: center;
      padding: ${units(3)};
      text-align: center;
      width: 100%;
    }

    #remove-image {
      color: ${black38};
      cursor: pointer;
      margin: 0;
    }
`;

const NoPreview = styled.span`
  // Hmm, not sure what conditions trigger this state
  // @chris 2017-1012
  height: 0;
  width: 0;
  display: block;
  margin: ${units(2)} 0 0;
  position: relative;
`;

const Preview = styled.span`
  background-image: url(${props => props.image});
  background-position: center center;
  background-repeat: no-repeat;
  background-size: contain;
  display: block;
  margin: ${units(2)} 0 0;
  position: relative;
  height: ${previewSize};
  width: ${previewSize};
`;

const UploadMessage = ({ type, about }) => type === 'image' ? (
  <FormattedMessage
    id="uploadImage.message"
    defaultMessage="Drop an image file here, or click to upload a file (max size: {upload_max_size}, allowed extensions: {upload_extensions}, allowed dimensions between {upload_min_dimensions} and {upload_max_dimensions} pixels)"
    values={{
      upload_max_size: about.upload_max_size,
      upload_extensions: about.upload_extensions,
      upload_max_dimensions: about.upload_max_dimensions,
      upload_min_dimensions: about.upload_min_dimensions,
    }}
  />
) : (
  <FormattedMessage
    id="uploadImage.videoMessage"
    defaultMessage="Drop a video file here, or click to upload a file (max size: {video_max_size}, allowed extensions: {video_extensions})"
    values={{
      video_max_size: about.video_max_size,
      video_extensions: about.video_extensions,
    }}
  />
);
UploadMessage.propTypes = {
  type: PropTypes.oneOf(['image', 'video']).isRequired,
  about: PropTypes.shape({
    upload_max_size: PropTypes.string.isRequired,
    upload_extensions: PropTypes.string.isRequired,
    upload_max_dimensions: PropTypes.string.isRequired,
    upload_min_dimensions: PropTypes.string.isRequired,
    video_max_size: PropTypes.string.isRequired,
    video_extensions: PropTypes.string.isRequired,
  }).isRequired,
};

class UploadImageComponent extends React.PureComponent {
  onDrop = (files) => {
    const {
      about,
      type,
      onChange,
      onError,
    } = this.props;
    const file = files[0];
    const extensions = type === 'image' ? about.upload_extensions : about.video_extensions;
    const maxSize = type === 'image' ? about.upload_max_size : about.video_max_size;
    const valid_extensions = extensions.toLowerCase().split(/[\s,]+/);
    const extension = file.name.substr(file.name.lastIndexOf('.') + 1).toLowerCase();
    if (valid_extensions.length > 0 && valid_extensions.indexOf(extension) < 0) {
      onError(file, <FormattedMessage
        id="uploadImage.invalidExtension"
        defaultMessage='The file cannot have type "{extension}". Please try with the following file types: {allowed_types}.'
        values={{ extension, allowed_types: extensions }}
      />);
      return;
    }
    if (file.size && unhumanizeSize(maxSize) < file.size) {
      onError(file, <FormattedMessage
        id="uploadImage.fileTooLarge"
        defaultMessage="The file size should be less than {size}. Please try with a smaller file."
        values={{ size: maxSize }}
      />);
      return;
    }

    onChange(file);
  }

  onDelete = () => {
    this.props.onChange(null);
  }

  maybePreview() {
    const { value, noPreview, type } = this.props;

    if (type !== 'image') {
      return null;
    }

    if (value) {
      return (
        <Row>
          {noPreview ? <NoPreview /> : <Preview image={value.preview} />}
          <span className="no-preview" />
          <StyledIconButton id="remove-image" onClick={this.onDelete}>
            <MdHighlightRemove />
          </StyledIconButton>
        </Row>
      );
    }
    return null;
  }

  render() {
    const { about, value, type } = this.props;
    return (
      <StyledUploader>
        {this.maybePreview()}
        <Dropzone
          onDrop={this.onDrop}
          multiple={false}
          className={value ? 'with-file' : 'without-file'}
        >
          <div>
            {value ? (
              <FormattedMessage
                id="uploadImage.changeFile"
                defaultMessage="{filename} (click or drop to change)"
                values={{ filename: value.name }}
              />
            ) : (
              <UploadMessage type={type} about={about} />
            )}
          </div>
        </Dropzone>
        <br />
      </StyledUploader>
    );
  }
}

const UploadImage = childProps => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query UploadImageQuery {
        about {
          upload_max_size
          upload_extensions
          video_max_size
          video_extensions
          upload_max_dimensions
          upload_min_dimensions
        }
      }
    `}
    render={({ error, props }) => {
      if (error) {
        return <div className="TODO-handle-error">{error.message}</div>;
      } else if (props) {
        return <UploadImageComponent about={props.about} {...childProps} />;
      }
      return <CircularProgress />;
    }}
  />
);
UploadImage.defaultProps = {
  value: null,
  noPreview: false,
};
UploadImage.propTypes = {
  value: PropTypes.object, // or null
  type: PropTypes.oneOf(['image', 'video']).isRequired,
  noPreview: PropTypes.bool,
  onChange: PropTypes.func.isRequired, // func(Image) => undefined
  onError: PropTypes.func.isRequired, // func(Image?, <FormattedMessage ...>) => undefined
};

export default UploadImage;
