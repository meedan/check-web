import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Dropzone from 'react-dropzone';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import cx from 'classnames/bind';
import Loader from './cds/loading/Loader';
import ButtonMain from './cds/buttons-checkboxes-chips/ButtonMain';
import ClearIcon from '../icons/clear.svg';
import FilePresentIcon from '../icons/file_present.svg';
import { unhumanizeSize } from '../helpers';
import styles from './UploadFile.module.css';

const UploadMessage = ({ about, type }) => {
  switch (type) {
  case 'image': return (
    <FormattedHTMLMessage
      defaultMessage="<p>Click or drag an image here to upload.</p><p>Max File Size: <strong>{upload_max_size}</strong></p><p>Allowed Extensions: <strong>{upload_extensions}</strong></p><p>Allowed Dimensions: <strong>{upload_min_dimensions} and {upload_max_dimensions} pixels</strong></p>"
      description="Message to the user describing the requirements for uploading an image"
      id="uploadFile.message"
      tagName="div"
      values={{
        upload_max_size: about?.upload_max_size,
        upload_extensions: about?.upload_extensions?.join(', '),
        upload_max_dimensions: about?.upload_max_dimensions,
        upload_min_dimensions: about?.upload_min_dimensions,
      }}
    />
  );
  case 'video': return (
    <FormattedHTMLMessage
      defaultMessage="<p>Click or drag a video file here to upload.</p><p>Max File Size: <strong>{video_max_size}</strong></p><p>Allowed Extensions: <strong>{video_extensions}</strong></p>"
      description="Message to the user describing the requirements for uploading a video"
      id="uploadFile.videoMessage"
      tagName="div"
      values={{
        video_max_size: about?.video_max_size,
        video_extensions: about?.video_extensions?.join(', '),
      }}
    />
  );
  case 'audio': return (
    <FormattedHTMLMessage
      defaultMessage="<p>Click or drag an audio file here to upload.</p><p>Max File Size: <strong>{audio_max_size}</strong></p><p>Allowed Extensions: <strong>{audio_extensions}</strong></p>"
      description="Message to the user describing the requirements for uploading an audio file"
      id="uploadFile.audioMessage"
      tagName="div"
      values={{
        audio_max_size: about?.audio_max_size,
        audio_extensions: about?.audio_extensions?.join(', '),
      }}
    />
  );

  case 'file': return (
    <FormattedMessage
      defaultMessage="<>Click or drag a file here to upload.</><p><p>Max File Size: <strong>{file_max_size}</strong></p><p>Allowed Extensions: <strong>{file_extensions}</strong></p>"
      description="Message to the user describing the requirements for uploading a file using this component"
      id="uploadFile.fileMessage"
      tagName="div"
      values={{
        file_max_size: about?.file_max_size,
        file_extensions: about?.file_extensions?.join(', '),
      }}
    />
  );

  case 'image+video+audio': return (
    <FormattedHTMLMessage
      defaultMessage="<p>Click or drag a file here to upload.</p><p>Max File Size: <strong>{file_max_size}</strong></p><p>Allowed Extensions: <strong>{file_extensions}</strong></p>"
      description="Message to the user describing the requirements for uploading an image, video, or audio file using this component"
      id="uploadFile.imageVideoAudioMessage"
      tagName="div"
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
  type: PropTypes.oneOf(['image', 'video', 'audio', 'file', 'image+video+audio']).isRequired,
};

class UploadFileComponent extends React.PureComponent {
  onDrop = (files) => {
    const {
      about,
      onChange,
      onError,
      type,
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
        defaultMessage='The file cannot have type "{extension}". Please try with the following file types: {allowed_types}.'
        description="Error message when the user tries to upload a file with a not accepted file extension"
        id="uploadFile.invalidExtension"
        values={{ extension, allowed_types: extensions.join(', ') }}
      />);
      return;
    }
    if (file.size && unhumanizeSize(maxSize) < file.size) {
      onError(file, <FormattedMessage
        defaultMessage="The file size should be less than {size}. Please try with a smaller file."
        description="Error message when the user tries to upload a file that is over the size limit"
        id="uploadFile.fileTooLarge"
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
    const { noPreview, type, value } = this.props;

    if (type !== 'image') {
      return null;
    }

    if (value) {
      return (
        <div className={styles.PreviewWrapper}>
          {noPreview ?
            <div className={styles.NoPreview}>
              <FilePresentIcon />
            </div>
            :
            <div
              className={styles.Preview}
              image={value.preview}
              style={{
                backgroundImage: `url(${value.preview})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
              }}
            />
          }
          <ButtonMain
            buttonProps={{
              id: 'remove-image',
            }}
            className="int-remove-upload__button--preview"
            iconLeft={<ClearIcon />}
            label={
              <FormattedMessage
                defaultMessage="Remove"
                description="Label for the remove uploaded file button"
                id="uploadFile.removeFileButton"
              />
            }
            size="small"
            theme="lightBeige"
            variant="contained"
            onClick={this.onDelete}
          />
        </div>
      );
    }
    return null;
  }

  render() {
    const {
      about,
      disabled,
      type,
      value,
    } = this.props;
    return (
      <div className={styles.UploadFile}>
        {this.maybePreview()}
        <Dropzone
          className={cx(
            value ? styles['UploadFile-with-file'] : styles['UploadFile-without-file'],
            value ? 'int-uploadfile__dropzone-with-file' : 'int-uploadfile__dropzone-without-file',
          )}
          disabled={disabled}
          multiple={false}
          onDrop={this.onDrop}
        >
          {value ? (
            <FormattedHTMLMessage
              defaultMessage="<strong>{filename}</strong>(click or drop to change)"
              description="Output of the uploaded filename and how to change the file"
              id="uploadFile.changeFile"
              values={{ filename: value.name }}
            />
          ) : (
            <UploadMessage about={about} type={type} />
          )}
        </Dropzone>
      </div>
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
      return <Loader size="medium" theme="grey" variant="inline" />;
    }}
  />
);
UploadFile.defaultProps = {
  value: null,
  noPreview: false,
  disabled: false,
};
UploadFile.propTypes = {
  disabled: PropTypes.bool,
  noPreview: PropTypes.bool,
  type: PropTypes.oneOf(['image', 'video', 'audio', 'image+video+audio']).isRequired,
  value: PropTypes.object, // or null
  onChange: PropTypes.func.isRequired, // func(Image) => undefined
  onError: PropTypes.func.isRequired, // func(Image?, <FormattedMessage ...>) => undefined
};
// eslint-disable-next-line
export { UploadFileComponent };
export default UploadFile;
