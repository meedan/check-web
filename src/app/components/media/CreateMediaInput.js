import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import InsertPhotoIcon from '@material-ui/icons/InsertPhoto';
import MovieIcon from '@material-ui/icons/Movie';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';
import FormatQuoteIcon from '@material-ui/icons/FormatQuote';
import LinkIcon from '@material-ui/icons/Link';
import styled from 'styled-components';
import urlRegex from 'url-regex';
import MediaStatusCommon from './MediaStatusCommon';
import Message from '../Message';
import UploadFile from '../UploadFile';
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
  svg {
    padding: 0 ${units(0.5)};
    color: ${props => props.active ? black87 : black38} !important;
  }
`;

class CreateMediaInput extends React.Component {
  state = {
    mode: 'link',
    textValue: '',
    mediaFile: null,
    mediaMessage: null,
    status: 'undetermined',
    // claimText: '',
  };

  getMediaInputValue = () => {
    const { mode, mediaFile, textValue } = this.state;
    let mediaType = '';
    let file = '';
    let inputValue = '';
    let urls = '';
    let url = '';
    let quote = '';

    if (['image', 'video', 'audio'].indexOf(mode) > -1) {
      file = mediaFile;
      if (mode === 'image') {
        mediaType = 'UploadedImage';
      } else if (mode === 'video') {
        mediaType = 'UploadedVideo';
      } else if (mode === 'audio') {
        mediaType = 'UploadedAudio';
      }
      if (!file) {
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
    if (file !== '') {
      title = file.name;
    }

    if (url || quote || file) {
      return ({
        url,
        quote,
        file,
        title,
        mode: this.state.mode,
        mediaType,
      });
    }

    return null;
  };

  get currentErrorMessageOrNull() {
    const { mode, mediaMessage } = this.state;
    if (['video', 'audio', 'image'].indexOf(mode) > -1) {
      return mediaMessage;
    }
    return this.props.message; // hopefully null
  }

  setStatus = (context, store, media, newStatus) => {
    this.setState({ status: newStatus });
  };

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
    this.resetForm();
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

  resetForm() {
    this.setState({
      textValue: '',
      mediaFile: null,
      mediaMessage: null,
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
      <UploadFile
        key="createMedia.image.upload"
        type="image"
        onChange={this.handleFileChange}
        onError={this.handleFileError}
        value={this.state.mediaFile}
      />
    );
    case 'video': return (
      <UploadFile
        key="createMedia.video.upload"
        type="video"
        onChange={this.handleFileChange}
        onError={this.handleFileError}
        value={this.state.mediaFile}
        noPreview
      />
    );
    case 'audio': return (
      <UploadFile
        key="createMedia.audio.upload"
        type="audio"
        onChange={this.handleFileChange}
        onError={this.handleFileError}
        value={this.state.mediaFile}
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
              <Button
                id="create-media__audio"
                onClick={e => this.handleTabChange(e, 'audio')}
              >
                <StyledTabLabel active={this.state.mode === 'audio'}>
                  <VolumeUpIcon />
                  <StyledTabLabelText>
                    <FormattedMessage id="createMedia.audio" defaultMessage="Audio" />
                  </StyledTabLabelText>
                </StyledTabLabel>
              </Button>
            </Row>
            <Row>
              <MediaStatusCommon
                media={{
                  team: this.props.team,
                }}
                setStatus={this.setStatus}
                quickAdd
                currentStatus={this.state.status}
              />
            </Row>
          </div>
        </form>
      </div>
    );
  }
}

export default CreateMediaInput;
