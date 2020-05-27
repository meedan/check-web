import React from 'react';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
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

const messages = defineMessages({
  mediaInput: {
    id: 'createMedia.mediaInput',
    defaultMessage: 'Paste or type',
  },
  quoteInput: {
    id: 'createMedia.quoteInput',
    defaultMessage: 'Paste or type a text',
  },
  uploadImage: {
    id: 'createMedia.uploadImage',
    defaultMessage: 'Upload an image',
  },
  invalidUrl: {
    id: 'createMedia.invalidUrl',
    defaultMessage: 'Please enter a valid URL',
  },
});

class CreateMediaInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      mode: 'link',
    };
  }

  getMediaInputValue = () => {
    let mediaType = '';
    let image = '';
    let video = '';
    let inputValue = '';
    let urls = '';
    let url = '';
    let quote = '';

    if (this.state.mode === 'image') {
      ({ media: { image } } = document.forms);
      mediaType = 'UploadedImage';
      if (!image) {
        return null;
      }
    } else if (this.state.mode === 'video') {
      ({ media: { video } } = document.forms);
      mediaType = 'UploadedVideo';
      if (!video) {
        return null;
      }
    } else if (this.state.mode === 'quote') {
      quote = this.state.textValue.trim();
      if (!quote) {
        return null;
      }
      mediaType = 'Claim';
    } else {
      inputValue = this.state.textValue.trim();
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

  handleKeyPress = (e) => {
    this.setState({ message: null });

    if (e.key === 'Enter' && !e.shiftKey) {
      this.handleSubmit();
    }
  };

  handleSubmit = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();

    const value = this.getMediaInputValue();
    if (!value) {
      return;
    }

    this.resetForm();

    if (this.props.onSubmit) {
      this.props.onSubmit(value);
    }
  };

  handleTabChange = (e, mode) => {
    this.setState({ mode, message: null });
    if (this.props.onTabChange) {
      this.props.onTabChange(mode);
    }
  }

  handleVideo = (file) => {
    this.setState({ message: null });
    document.forms.media.video = file;
  };

  handleImage = (file) => {
    this.setState({ message: null });
    document.forms.media.image = file;
  };

  handleImageError = (file, message) => {
    this.setState({ message });
  };

  handleChange = (ev) => {
    const textValue = ev.target.value;

    this.setState({
      textValue,
      message: null,
    });
  };

  resetForm() {
    // TODO Use React refs
    ['create-media-quote-input', 'create-media-input']
      .forEach((id) => {
        const field = document.getElementById(id);
        if (field) {
          field.value = '';
        }
      });
    const removeImage = document.getElementById('remove-image');
    if (removeImage) {
      removeImage.click();
    }
    document.forms.media.image = null;
    this.setState({ textValue: null });
  }

  renderFormInputs() {
    const defaultInputProps = {
      fullWidth: true,
      multiline: true,
      onKeyPress: this.handleKeyPress,
      onChange: this.handleChange,
      margin: 'normal',
    };

    switch (this.state.mode) {
    case 'image':
      return [
        <UploadImage
          key="createMedia.image.upload"
          type="image"
          onImage={this.handleImage}
          onError={this.handleImageError}
        />,
      ];
    case 'video':
      return [
        <UploadImage
          key="createMedia.video.upload"
          type="video"
          onImage={this.handleVideo}
          onError={this.handleImageError}
          noPreview
        />,
      ];
    case 'quote': {
      return [
        <TextField
          key="createMedia.quote.input"
          placeholder={this.props.intl.formatMessage(messages.quoteInput)}
          name="quote"
          id="create-media-quote-input"
          value={this.state.textValue || ''}
          autoFocus
          {...defaultInputProps}
        />,
      ];
    }
    case 'link':
    default:
      return [
        <TextField
          key="createMedia.media.input"
          placeholder={this.props.intl.formatMessage(messages.mediaInput)}
          name="url"
          id="create-media-input"
          value={this.state.textValue || ''}
          autoFocus
          {...defaultInputProps}
        />,
      ];
    }
  }

  render() {
    return (
      <div>
        <Message className="create-media__message" message={this.props.message || this.state.message} />

        <form
          name="media"
          id={this.props.formId /* so outsiders can write <button type="submit" form="...id"> */}
          className="create-media__form"
          onSubmit={this.handleSubmit}
        >
          <div id="create-media__field">
            {this.renderFormInputs()}
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

export default injectIntl(CreateMediaInput);
