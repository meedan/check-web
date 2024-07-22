import React from 'react';
import { FormattedMessage } from 'react-intl';
import urlRegex from 'url-regex';
import Alert from '../cds/alerts-and-prompts/Alert';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import TextArea from '../cds/inputs/TextArea';
import ClearIcon from '../../icons/clear.svg';
import UploadFile from '../UploadFile';
import inputStyles from '../../styles/css/inputs.module.css';

class CreateMediaInput extends React.Component {
  state = {
    textValue: '',
    mediaFile: null,
    mediaMessage: null,
    status: this.props.team?.verification_statuses?.default,
    claimText: '',
  };

  getMediaInputValue = () => {
    const { mediaFile, textValue, claimText } = this.state;
    const inferMediaTypeFromMimeType = (mimeType) => {
      if (mimeType.match(/^audio/)) {
        return 'UploadedAudio';
      } else if (mimeType.match(/^image/)) {
        return 'UploadedImage';
      } else if (mimeType.match(/^video/)) {
        return 'UploadedVideo';
      }
      return null;
    };

    let mediaType = '';
    let file = '';
    let inputValue = '';
    let urls = '';
    let url = '';
    let quote = '';

    if (mediaFile) {
      file = mediaFile;
      if (!file) {
        return null;
      }
      mediaType = inferMediaTypeFromMimeType(file.type);
    } else {
      inputValue = textValue.trim();
      urls = inputValue.match(urlRegex());
      url = urls && urls[0] ? urls[0] : '';
      mediaType = 'Link';
      if (!inputValue || !inputValue.length) {
        return null;
      }
      if (!url.length || inputValue !== url) {
        // if anything other than a single url, save it as a quote
        quote = inputValue;
        mediaType = 'Claim';
      }
    }

    let title = 'Media';
    if (quote !== '') {
      title = quote;
    }
    if (url !== '') {
      title = url;
    }
    if (file !== '') {
      title = file.name;
    }

    if (url || quote || file) {
      return ({
        url,
        quote,
        file,
        title,
        mediaType,
        claimDescription: claimText,
      });
    }

    return null;
  };

  get currentErrorMessageOrNull() {
    return this.state.mediaMessage || null;
  }

  setStatus = (context, store, media, newStatus) => {
    this.setState({ status: newStatus });
  };

  handleKeyPress = (ev) => {
    if (ev.key === 'Enter' && ev.shiftKey) {
      ev.preventDefault();
      this.callOnSubmit();
    }
  };

  handleSubmit = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    this.callOnSubmit();
  }

  callOnSubmit() {
    const value = this.getMediaInputValue();
    if (!value) {
      return;
    }

    this.resetForm();

    if (this.props.onSubmit) {
      this.props.onSubmit(value, this.state.status);
    }
  }

  clearFile = () => {
    this.setState({
      mediaFile: null,
      mediaMessage: null,
    });
  }

  handleFileChange = (file) => {
    this.setState({ mediaFile: file, mediaMessage: null });
  };

  handleFileError = (file, message) => {
    this.setState({ mediaFile: null, mediaMessage: message });
  };

  handleChange = (ev) => {
    const textValue = ev.target.value;
    this.setState({ textValue });
  };

  handleClaimChange = (ev) => {
    const claimText = ev.target.value;
    this.setState({ claimText });
  };

  resetForm() {
    this.setState({
      textValue: '',
      mediaFile: null,
      mediaMessage: null,
    });
  }

  renderFormInput() {
    return (
      <>
        {
          this.state.mediaFile === null ? (
            <div className={inputStyles['form-fieldset-field']}>
              <FormattedMessage
                id="createMedia.mediaInput"
                defaultMessage="Add a URL to a social media post or webpage, or a block of text."
                description="Placeholder text for the media URL input"
              >
                { placeholder => (
                  <TextArea
                    key="createMedia.media.input"
                    maxHeight="126px"
                    name="text"
                    id="create-media-input"
                    placeholder={placeholder}
                    value={this.state.textValue}
                    onChange={this.handleChange}
                    onKeyPress={this.handleKeyPress}
                    disabled={this.state.mediaFile}
                    label={
                      <FormattedMessage
                        id="createMedia.mediaInputLabel"
                        defaultMessage="URL or Text Block"
                        description="Label for the text input for claim title"
                      />
                    }
                    helpContent={
                      <FormattedMessage id="createMedia.mediaMediaSubtitle" defaultMessage="The media that contains the claim." description="Subtitle for the section of the media that contains the claim being created" />
                    }
                  />
                )}
              </FormattedMessage>
            </div>
          ) : null
        }
        {
          (this.state.mediaFile === null && this.state.textValue.length === 0) ? (
            <div className={inputStyles['form-fieldset-title']}>
              <FormattedMessage id="createMedia.or" defaultMessage="or" description="This will appear between two mutually exclusive inputs. If the user fills in one, then the other will be disabled." />
            </div>
          ) : null
        }
        {
          this.state.textValue.length === 0 ? (
            <div className={inputStyles['form-fieldset-field']}>
              <UploadFile
                key="createMedia.image.upload"
                type="image+video+audio"
                onChange={this.handleFileChange}
                onError={this.handleFileError}
                value={this.state.mediaFile}
                disabled={this.state.textValue.length > 0}
                hidden={this.state.textValue.length > 0}
              />
              {
                this.state.mediaFile ? (
                  <ButtonMain
                    className="clear-button"
                    variant="text"
                    theme="lightText"
                    size="default"
                    iconLeft={<ClearIcon />}
                    onClick={this.clearFile}
                    label={
                      <FormattedMessage id="createMedia.mediaRemoveFile" defaultMessage="Remove file" description="Label on a button that the user clicks in order to return a file upload box back to its 'empty' state." />
                    }
                  />
                ) : null
              }
            </div>
          ) : null
        }
      </>
    );
  }

  render() {
    return (
      <>
        { this.state.mediaMessage &&
          <Alert
            className="create-media__message"
            content={this.currentErrorMessageOrNull}
            variant="error"
          />
        }
        <form
          name="media"
          id={this.props.formId /* so outsiders can write <button type="submit" form="...id"> */}
          className="create-media__form"
          ref={this.props.formRef}
          onSubmit={this.handleSubmit}
        >
          <div id="create-media__field" className={inputStyles['form-fieldset']}>
            {this.renderFormInput()}
          </div>
        </form>
      </>
    );
  }
}

export default CreateMediaInput;
