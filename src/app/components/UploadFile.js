import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Dropzone from 'react-dropzone';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import ButtonMain from './cds/buttons-checkboxes-chips/ButtonMain';
import ClearIcon from '../icons/clear.svg';
import CircularProgress from './CircularProgress';
import { unhumanizeSize } from '../helpers';

const StyledUploader = styled.div`
    display: flex;
    gap: 8px;
    margin: 8px 0 16px;
    align-items: center;

    .with-file,
    .without-file {
      align-items: center;
      border: 2px dashed var(--textDisabled);
      color: var(--textDisabled);
      cursor: pointer;
      display: flex;
      height: auto;
      justify-content: center;
      padding: 24px;
      text-align: center;
      width: 100%;
    }
`;

const NoPreview = styled.span`
  // Hmm, not sure what conditions trigger this state
  // @chris 2017-1012
  height: 0;
  width: 0;
  display: block;
  margin: 16px 0 0;
  position: relative;
`;

const Preview = styled.span`
  background-image: url(${props => props.image});
  background-position: center center;
  background-repeat: no-repeat;
  background-size: contain;
  display: block;
  position: relative;
  height: 80px;
  width: 80px;
`;

const UploadMessage = ({ type, about }) => {
  switch (type) {
  case 'image': return (
    <FormattedMessage
      id="uploadFile.message"
      defaultMessage="Drop an image file here, or click to upload a file (max size: {upload_max_size}, allowed extensions: {upload_extensions}, allowed dimensions between {upload_min_dimensions} and {upload_max_dimensions} pixels)"
      description="Message to the user describing the requirements for uploading an image"
      values={{
        upload_max_size: about?.upload_max_size,
        upload_extensions: about?.upload_extensions?.join(', '),
        upload_max_dimensions: about?.upload_max_dimensions,
        upload_min_dimensions: about?.upload_min_dimensions,
      }}
    />
  );
  case 'video': return (
    <FormattedMessage
      id="uploadFile.videoMessage"
      defaultMessage="Drop a video file here, or click to upload a file (max size: {video_max_size}, allowed extensions: {video_extensions})"
      description="Message to the user describing the requirements for uploading a video"
      values={{
        video_max_size: about?.video_max_size,
        video_extensions: about?.video_extensions?.join(', '),
      }}
    />
  );
  case 'audio': return (
    <FormattedMessage
      id="uploadFile.audioMessage"
      defaultMessage="Drop an audio file here, or click to upload a file (max size: {audio_max_size}, allowed extensions: {audio_extensions})"
      description="Message to the user describing the requirements for uploading an audio file"
      values={{
        audio_max_size: about?.audio_max_size,
        audio_extensions: about?.audio_extensions?.join(', '),
      }}
    />
  );

  case 'file': return (
    <FormattedMessage
      id="uploadFile.fileMessage"
      defaultMessage="Drop a file here, or click to upload a file (max size: {file_max_size}, allowed extensions: {file_extensions})"
      description="Message to the user describing the requirements for uploading a file using this component"
      values={{
        file_max_size: about?.file_max_size,
        file_extensions: about?.file_extensions?.join(', '),
      }}
    />
  );

  case 'image+video+audio': return (
    <FormattedMessage
      id="uploadFile.imageVideoAudioMessage"
      defaultMessage="Drop a file here, or click to upload a file (max size: {file_max_size}, allowed extensions: {file_extensions})"
      description="Message to the user describing the requirements for uploading an image, video, or audio file using this component"
      values={{
        file_max_size: about?.file_max_size,
        file_extensions: about?.upload_extensions
          ?.concat(about?.video_extensions)
          ?.concat(about?.audio_extensions)
          ?.join(', '),
      }}
    />
  );
  default: return null;
  }
};

UploadMessage.propTypes = {
  type: PropTypes.oneOf(['image', 'video', 'audio', 'file', 'image+video+audio']).isRequired,
  about: PropTypes.shape({
    upload_max_size: PropTypes.string.isRequired,
    upload_extensions: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
    upload_max_dimensions: PropTypes.string.isRequired,
    upload_min_dimensions: PropTypes.string.isRequired,
    video_max_size: PropTypes.string.isRequired,
    video_extensions: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
    audio_max_size: PropTypes.string.isRequired,
    audio_extensions: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
    file_max_size: PropTypes.string.isRequired,
    file_extensions: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  }).isRequired,
};

class UploadFileComponent extends React.PureComponent {
  onDrop = (files) => {
    const {
      about,
      type,
      onChange,
      onError,
    } = this.props;
    const file = files[0];
    let extensions = '';
    let maxSize = 0;
    if (type === 'image') {
      extensions = about.upload_extensions;
      maxSize = about.upload_max_size;
    } else if (type === 'video') {
      extensions = about.video_extensions;
      maxSize = about.video_max_size;
    } else if (type === 'audio') {
      extensions = about.audio_extensions;
      maxSize = about.audio_max_size;
    } else if (type === 'file') {
      extensions = about.file_extensions;
      maxSize = about.file_max_size;
    } else if (type === 'image+video+audio') {
      extensions = about.upload_extensions
        .concat(about.video_extensions)
        .concat(about.audio_extensions);
      maxSize = about.upload_max_size;
    }
    const valid_extensions = extensions.map(ext => ext.toLowerCase());
    const extension = file.name.substr(file.name.lastIndexOf('.') + 1).toLowerCase();
    if (valid_extensions.length > 0 && valid_extensions.indexOf(extension) < 0) {
      onError(file, <FormattedMessage
        id="uploadFile.invalidExtension"
        defaultMessage='The file cannot have type "{extension}". Please try with the following file types: {allowed_types}.'
        description="Error message when the user tries to upload a file with a not accepted file extension"
        values={{ extension, allowed_types: extensions.join(', ') }}
      />);
      return;
    }
    if (file.size && unhumanizeSize(maxSize) < file.size) {
      onError(file, <FormattedMessage
        id="uploadFile.fileTooLarge"
        defaultMessage="The file size should be less than {size}. Please try with a smaller file."
        description="Error message when the user tries to upload a file that is over the size limit"
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
        <div style={{ display: 'flex' }}>
          {noPreview ? <NoPreview /> : <Preview image={value.preview} />}
          <span className="no-preview" />
          <ButtonMain
            iconCenter={<ClearIcon />}
            variant="contained"
            size="small"
            theme="text"
            onClick={this.onDelete}
            buttonProps={{
              id: 'remove-image',
            }}
          />
        </div>
      );
    }
    return null;
  }

  render() {
    const {
      about,
      value,
      type,
      disabled,
    } = this.props;
    return (
      <StyledUploader>
        {this.maybePreview()}
        <Dropzone
          onDrop={this.onDrop}
          multiple={false}
          className={value ? 'with-file' : 'without-file'}
          disabled={disabled}
        >
          <div>
            {value ? (
              <FormattedMessage
                id="uploadFile.changeFile"
                defaultMessage="{filename} (click or drop to change)"
                description="Output of the uploaded filename and how to change the file"
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

const UploadFile = childProps => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query UploadFileQuery {
        about {
          upload_max_size
          upload_extensions
          video_max_size
          video_extensions
          audio_max_size
          audio_extensions
          file_max_size
          file_extensions
          upload_max_dimensions
          upload_min_dimensions
        }
      }
    `}
    render={({ error, props }) => {
      if (error) {
        return <div className="TODO-handle-error">{error.message}</div>;
      } else if (props) {
        return <UploadFileComponent about={props.about} {...childProps} />;
      }
      return <CircularProgress />;
    }}
  />
);
UploadFile.defaultProps = {
  value: null,
  noPreview: false,
  disabled: false,
};
UploadFile.propTypes = {
  value: PropTypes.object, // or null
  type: PropTypes.oneOf(['image', 'video', 'audio', 'image+video+audio']).isRequired,
  noPreview: PropTypes.bool,
  onChange: PropTypes.func.isRequired, // func(Image) => undefined
  onError: PropTypes.func.isRequired, // func(Image?, <FormattedMessage ...>) => undefined
  disabled: PropTypes.bool,
};
// eslint-disable-next-line
export { UploadFileComponent };
export default UploadFile;
