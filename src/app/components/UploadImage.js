import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import Dropzone from 'react-dropzone';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import MdHighlightRemove from 'react-icons/lib/md/highlight-remove';
import styled from 'styled-components';
import rtlDetect from 'rtl-detect';
import AboutRoute from '../relay/AboutRoute';
import { unhumanizeSize } from '../helpers';
import {
  black38,
  Row,
  units,
  borderWidthMedium,
  borderRadiusLarge,
  StyledIconButton,
} from '../styles/js/shared';

const previewSize = units(10);

const StyledUploader = styled.div`
    display: flex;
    margin: ${units(1)} 0 ${units(2)};
    align-items: flex-start;

    .with-file,
    .without-file {
      align-items: flex-start;
      border: ${borderWidthMedium} dashed ${black38};
      border-radius: ${borderRadiusLarge};
      color: ${black38};
      cursor: pointer;
      display: flex;
      height: auto;
      justify-content: center;
      padding: ${units(3)};
      text-align: center;
      width: 100%;
    }

    .preview {
      background-position: center center;
      background-repeat: no-repeat;
      background-size: contain;
      display: block;
      margin: ${units(2)} 0 0;
      position: relative;
      height: ${previewSize};
      width: ${previewSize};
    }

    // Hmm, not sure what conditions trigger this state
    // @chris 2017-1012
    .no-preview {
      height: 0;
      width: 0;
      display: block;
      margin: ${units(2)} 0 0;
      position: relative;
    }

    #remove-image {
      color: ${black38};
      cursor: pointer;
      margin: 0;
    }
`;

const messages = defineMessages({
  changeFile: {
    id: 'uploadImage.changeFile',
    defaultMessage: '{filename} (click or drop to change)',
  },
  invalidExtension: {
    id: 'uploadImage.invalidExtension',
    defaultMessage: 'The file cannot have type "{extension}". Please try with the following file types: {allowed_types}.',
  },
  fileTooLarge: {
    id: 'uploadImage.fileTooLarge',
    defaultMessage: 'The file size should be less than {size}. Please try with a smaller file.',
  },
});

class UploadImageComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { file: null };
  }

  onDrop(files) {
    const file = files[0];
    const valid_extensions = this.props.about.upload_extensions.toLowerCase().split(/[\s,]+/);
    const extension = file.name.substr(file.name.lastIndexOf('.') + 1).toLowerCase();
    if (valid_extensions.length > 0 && valid_extensions.indexOf(extension) < 0) {
      if (this.props.onError) {
        this.props.onError(file, this.props.intl.formatMessage(
          messages.invalidExtension,
          { extension, allowed_types: this.props.about.upload_extensions },
        ));
      }
      return;
    }
    if (file.size && unhumanizeSize(this.props.about.upload_max_size) < file.size) {
      if (this.props.onError) {
        this.props.onError(file, this.props.intl.formatMessage(
          messages.fileTooLarge,
          { size: this.props.about.upload_max_size },
        ));
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
    const style = this.state.file ? { backgroundImage: `url(${this.state.file.preview})` } : {};

    if (this.state.file && this.props.noPreview) {
      return (
        <Row><span className="no-preview" />
          <StyledIconButton id="remove-image" onClick={this.onDelete.bind(this)}>
            <MdHighlightRemove />
          </StyledIconButton>
        </Row>
      );
    } else if (this.state.file) {
      return (
        <Row><span className="preview" style={style} />
          <StyledIconButton id="remove-image" onClick={this.onDelete.bind(this)}>
            <MdHighlightRemove />
          </StyledIconButton>
        </Row>
      );
    }
    return null;
  }

  render() {
    const { about } = this.props;

    return (
      <StyledUploader isRtl={rtlDetect.isRtlLang(this.props.intl.locale)}>
        { this.preview() }
        <Dropzone
          onDrop={this.onDrop.bind(this)}
          multiple={false}
          className={this.state.file ? 'with-file' : 'without-file'}
        >
          <div>
            { this.state.file ?
              this.props.intl.formatMessage(messages.changeFile, { filename: this.state.file.name })
              :
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
            }
          </div>
        </Dropzone>
        <br />
      </StyledUploader>
    );
  }
}

UploadImageComponent.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
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

const UploadImage = (props) => {
  const route = new AboutRoute();
  return (<Relay.RootContainer
    Component={UploadImageContainer}
    route={route}
    renderFetched={data => <UploadImageContainer {...props} {...data} />}
  />);
};

export default UploadImage;
