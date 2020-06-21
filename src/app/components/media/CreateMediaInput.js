import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import InsertPhotoIcon from '@material-ui/icons/InsertPhoto';
import MovieIcon from '@material-ui/icons/Movie';
import FormatQuoteIcon from '@material-ui/icons/FormatQuote';
import LinkIcon from '@material-ui/icons/Link';
import styled from 'styled-components';
import urlRegex from 'url-regex';
import Message from '../Message';
import UploadImage from '../UploadImage';
import {
  Row,
  units,
  caption,
  black38,
  black54,
  black87,
  mediaQuery,
} from '../../styles/js/shared';

const StyledTabLabelText = styled.span`
  ${mediaQuery.handheld`
    display: none;
  `}
`;

const StyledTabLabel = styled.span`
  display: flex;
  align-items: center;
  color: ${props => props.active ? black87 : black54} !important;
  font: ${caption};
  text-transform: none;
  svg {
    padding: 0 ${units(0.5)};
    color: ${props => props.active ? black87 : black38} !important;
  }
`;

class CreateMediaInput extends React.Component {
  state = {
    mode: 'link',
    textValue: '',
    imageFile: null,
    imageMessage: null,
    videoFile: null,
    videoMessage: null,
  };

  getMediaInputValue = () => {
    const {
      mode,
      imageFile,
      videoFile,
      textValue,
    } = this.state;
    let mediaType = '';
    let image = '';
    let video = '';
    let inputValue = '';
    let urls = '';
    let url = '';
    let quote = '';

    if (mode === 'image') {
      image = imageFile;
      mediaType = 'UploadedImage';
      if (!image) {
        return null;
      }
    } else if (mode === 'video') {
      video = videoFile;
      mediaType = 'UploadedVideo';
      if (!video) {
        return null;
      }
    } else if (mode === 'quote') {
      quote = textValue.trim();
      if (!quote) {
        return null;
      }
      mediaType = 'Claim';
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
    if (image !== '') {
      title = image.name;
    }
    if (video !== '') {
      title = video.name;
    }

    if (url || quote || image || video) {
      return ({
        url,
        quote,
        image,
        video,
        title,
        mode: this.state.mode,
        mediaType,
      });
    }

    return null;
  };

  get currentErrorMessageOrNull() {
    const { mode, imageMessage, videoMessage } = this.state;
    if (mode === 'video' && videoMessage) {
      return videoMessage;
    } else if (mode === 'image' && imageMessage) {
      return imageMessage;
    }
    return this.props.message; // hopefully null
  }

  handleKeyPress = (ev) => {
    if (ev.key === 'Enter' && !ev.shiftKey) {
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
      this.props.onSubmit(value);
    }
  }

  handleTabChange = (e, mode) => {
    this.setState({ mode });
    if (this.props.onTabChange) {
      this.props.onTabChange(mode);
    }
  }

  handleImageChange = (file) => {
    this.setState({ imageFile: file, imageMessage: null });
  };

  handleImageError = (file, message) => {
    this.setState({ imageFile: null, imageMessage: message });
  };

  handleVideoChange = (file) => {
    this.setState({ videoFile: file, videoMessage: null });
  };

  handleVideoError = (file, message) => {
    this.setState({ videoFile: null, videoMessage: message });
  };

  handleChange = (ev) => {
    const textValue = ev.target.value;
    this.setState({ textValue });
  };

  resetForm() {
    this.setState({
      textValue: '',
      imageFile: null,
      imageMessage: null,
      videoFile: null,
      videoMessage: null,
    });
  }

  renderFormInput() {
    const defaultInputProps = {
      fullWidth: true,
      multiline: true,
      onKeyPress: this.handleKeyPress,
      onChange: this.handleChange,
      margin: 'normal',
    };

    switch (this.state.mode) {
    case 'image': return (
      <UploadImage
        key="createMedia.image.upload"
        type="image"
        onChange={this.handleImageChange}
        onError={this.handleImageError}
        value={this.state.imageFile}
      />
    );
    case 'video': return (
      <UploadImage
        key="createMedia.video.upload"
        type="video"
        onChange={this.handleVideoChange}
        onError={this.handleVideoError}
        value={this.state.videoFile}
        noPreview
      />
    );
    case 'quote': return (
      <FormattedMessage id="createMedia.quoteInput" defaultMessage="Paste or type a text">
        {placeholder => (
          <TextField
            key="createMedia.quote.input"
            placeholder={placeholder}
            name="quote"
            id="create-media-quote-input"
            value={this.state.textValue}
            autoFocus
            {...defaultInputProps}
          />
        )}
      </FormattedMessage>
    );
    case 'link':
    default: return (
      <FormattedMessage id="createMedia.mediaInput" defaultMessage="Paste or type">
        {placeholder => (
          <TextField
            key="createMedia.media.input"
            placeholder={placeholder}
            name="url"
            id="create-media-input"
            value={this.state.textValue}
            autoFocus
            {...defaultInputProps}
          />
        )}
      </FormattedMessage>
    );
    }
  }

  render() {
    return (
      <div>
        <Message className="create-media__message" message={this.currentErrorMessageOrNull} />

        <form
          name="media"
          id={this.props.formId /* so outsiders can write <button type="submit" form="...id"> */}
          className="create-media__form"
          ref={this.props.formRef}
          onSubmit={this.handleSubmit}
        >
          <div id="create-media__field">
            {this.renderFormInput()}
          </div>

          <div style={{ marginTop: units(2) }}>
            <Row>
              <Button
                id="create-media__link"
                onClick={e => this.handleTabChange(e, 'link')}
              >
                <StyledTabLabel active={this.state.mode === 'link'}>
                  <LinkIcon />
                  <StyledTabLabelText>
                    <FormattedMessage id="createMedia.link" defaultMessage="Link" />
                  </StyledTabLabelText>
                </StyledTabLabel>
              </Button>
              <Button
                id="create-media__quote"
                onClick={e => this.handleTabChange(e, 'quote')}
              >
                <StyledTabLabel active={this.state.mode === 'quote'}>
                  <FormatQuoteIcon />
                  <StyledTabLabelText>
                    <FormattedMessage id="createMedia.quote" defaultMessage="Text" />
                  </StyledTabLabelText>
                </StyledTabLabel>
              </Button>
              <Button
                id="create-media__image"
                onClick={e => this.handleTabChange(e, 'image')}
              >
                <StyledTabLabel active={this.state.mode === 'image'}>
                  <InsertPhotoIcon />
                  <StyledTabLabelText>
                    <FormattedMessage id="createMedia.image" defaultMessage="Photo" />
                  </StyledTabLabelText>
                </StyledTabLabel>
              </Button>
              <Button
                id="create-media__video"
                onClick={e => this.handleTabChange(e, 'video')}
              >
                <StyledTabLabel active={this.state.mode === 'video'}>
                  <MovieIcon />
                  <StyledTabLabelText>
                    <FormattedMessage id="createMedia.video" defaultMessage="Video" />
                  </StyledTabLabelText>
                </StyledTabLabel>
              </Button>
            </Row>
          </div>
        </form>
      </div>
    );
  }
}

export default CreateMediaInput;
