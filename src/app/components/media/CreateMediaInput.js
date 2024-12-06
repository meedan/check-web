import React from 'react';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
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
    const { claimText, mediaFile, textValue } = this.state;
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
        <FormattedMessage
          defaultMessage="Create a new media cluster in this workspace by adding the first piece of media for the new cluster."
          description="This is introduction text to tell the user what the process is for creating a new cluster of media"
          id="createMedia.createIntro"
          tagName="p"
        />
        <FormattedHTMLMessage
          defaultMessage="Media in a cluster can be a <strong>URL, block of text, image, audio, or video</strong>."
          description="This description is to let the user know what types of media can be created"
          id="createMedia.createIntroType"
          tagName="p"
        />
        {
          this.state.mediaFile === null ? (
            <>
              <div className={inputStyles['form-fieldset-title']}>
                <FormattedMessage defaultMessage="Text-based Media" description="This is a label for the text-based component to let the use know what type of media will be created" id="createMedia.textBased" />
              </div>
              <div className={inputStyles['form-fieldset-field']}>
                <FormattedMessage
                  defaultMessage="Add a URL to a social media post or webpage, or a block of text."
                  description="Placeholder text for the media URL input"
                  id="createMedia.mediaInput"
                >
                  { placeholder => (
                    <TextArea
                      disabled={this.state.mediaFile}
                      id="create-media-input"
                      key="createMedia.media.input"
                      label={
                        <FormattedMessage
                          defaultMessage="URL or Text Block"
                          description="Label for the text input for claim title"
                          id="createMedia.mediaInputLabel"
                        />
                      }
                      maxHeight="126px"
                      name="text"
                      placeholder={placeholder}
                      value={this.state.textValue}
                      onChange={this.handleChange}
                      onKeyPress={this.handleKeyPress}
                    />
                  )}
                </FormattedMessage>
              </div>
            </>
          ) : null
        }
        {
          (this.state.mediaFile === null && this.state.textValue.length === 0) ? (
            <div className={inputStyles['form-fieldset-title']}>
              <FormattedMessage defaultMessage="Audio/Visual Media" description="This is a label for the audio visual upload media component to let the use know what type of media will be created" id="createMedia.audioVisual" />
            </div>
          ) : null
        }
        {
          this.state.textValue.length === 0 ? (
            <div className={inputStyles['form-fieldset-field']}>
              <UploadFile
                disabled={this.state.textValue.length > 0}
                hidden={this.state.textValue.length > 0}
                key="createMedia.image.upload"
                type="image+video+audio"
                value={this.state.mediaFile}
                onChange={this.handleFileChange}
                onError={this.handleFileError}
              />
              {
                this.state.mediaFile ? (
                  <ButtonMain
                    className="clear-button"
                    iconLeft={<ClearIcon />}
                    label={
                      <FormattedMessage defaultMessage="Remove file" description="Label on a button that the user clicks in order to return a file upload box back to its 'empty' state." id="createMedia.mediaRemoveFile" />
                    }
                    size="default"
                    theme="lightText"
                    variant="text"
                    onClick={this.clearFile}
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
          className="create-media__form"
          id={this.props.formId /* so outsiders can write <button type="submit" form="...id"> */}
          name="media"
          ref={this.props.formRef}
          onSubmit={this.handleSubmit}
        >
          <div className={inputStyles['form-fieldset']} id="create-media__field">
            {this.renderFormInput()}
          </div>
        </form>
      </>
    );
  }
}

export default CreateMediaInput;
