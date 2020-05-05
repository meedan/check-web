import React from 'react';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import Button from '@material-ui/core/Button';
import SvgIcon from '@material-ui/core/SvgIcon';
import TextField from '@material-ui/core/TextField';
import IconInsertPhoto from '@material-ui/icons/InsertPhoto';
import Movie from '@material-ui/icons/Movie';
import IconLink from '@material-ui/icons/Link';
import MdFormatQuote from 'react-icons/lib/md/format-quote';
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

const StyledIcon = styled.div`
  svg {
    color: ${black38} !important;
    padding: 0 ${units(0.5)};
  }
`;

const StyledTabLabelText = styled.div`
  font: ${caption};
  text-transform: none;
  color: ${black54};
  ${mediaQuery.handheld`
    display: none;
  `}
`;

const StyledTabLabel = styled(Row)`
  ${props =>
    props.active
      ? `
      border-radius: ${units(3)};
      div {
        color: ${black87} !important;
        font-weight: 700 !important;
      }
      svg {
        color: ${black87} !important;
      }`
      : null}
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
      // TODO Use React ref
      quote = document.getElementById('create-media-quote-input').value.trim();
      mediaType = 'Claim';
    } else {
      // TODO Use React ref
      inputValue = document.getElementById('create-media-input').value.trim();
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

  handleSubmit = () => {
    const value = this.getMediaInputValue();

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
    this.setState({ message: null, submittable: true });
    document.forms.media.video = file;
  };

  handleImage = (file) => {
    this.setState({ message: null, submittable: true });
    document.forms.media.image = file;
  };

  handleImageError = (file, message) => {
    this.setState({ message, submittable: false });
  };

  handleChange = (e) => {
    const previousInput = e.target.value;

    this.setState({
      previousInput,
      message: null,
      submittable: (previousInput && previousInput.trim()),
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
    this.setState({ submittable: false, previousInput: null });
  }

  renderFormInputs() {
    const defaultInputProps = {
      fullWidth: true,
      multiLine: true,
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
          value={this.state.previousInput}
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
          value={this.state.previousInput}
          autoFocus
          {...defaultInputProps}
        />,
      ];
    }
  }

  render() {
    const styles = {
      svgIcon: {
        fontSize: units(3),
      },
    };

    const tabLabelLink = (
      <StyledTabLabel active={this.state.mode === 'link'}>
        <StyledIcon><IconLink /></StyledIcon>
        <StyledTabLabelText>
          <FormattedMessage id="createMedia.link" defaultMessage="Link" />
        </StyledTabLabelText>
      </StyledTabLabel>
    );

    const tabLabelQuote = (
      <StyledTabLabel active={this.state.mode === 'quote'}>
        <StyledIcon><SvgIcon style={styles.svgIcon}><MdFormatQuote /></SvgIcon></StyledIcon>
        <StyledTabLabelText>
          <FormattedMessage id="createMedia.quote" defaultMessage="Text" />
        </StyledTabLabelText>
      </StyledTabLabel>
    );

    const tabLabelImage = (
      <StyledTabLabel active={this.state.mode === 'image'}>
        <StyledIcon><IconInsertPhoto /></StyledIcon>
        <StyledTabLabelText>
          <FormattedMessage id="createMedia.image" defaultMessage="Photo" />
        </StyledTabLabelText>
      </StyledTabLabel>
    );

    const tabLabelVideo = (
      <StyledTabLabel active={this.state.mode === 'video'}>
        <StyledIcon><Movie /></StyledIcon>
        <StyledTabLabelText>
          <FormattedMessage id="createMedia.video" defaultMessage="Video" />
        </StyledTabLabelText>
      </StyledTabLabel>
    );

    return (
      <div>
        <Message className="create-media__message" message={this.props.message || this.state.message} />

        <form
          name="media"
          id="media-url-container"
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
                {tabLabelLink}
              </Button>
              <Button
                id="create-media__quote"
                onClick={e => this.handleTabChange(e, 'quote')}
              >
                {tabLabelQuote}
              </Button>
              <Button
                id="create-media__image"
                onClick={e => this.handleTabChange(e, 'image')}
              >
                {tabLabelImage}
              </Button>
              <Button
                id="create-media__video"
                onClick={e => this.handleTabChange(e, 'video')}
              >
                {tabLabelVideo}
              </Button>
              <Button
                id="create-media-submit"
                disabled={!this.state.submittable}
                onClick={this.handleSubmit}
                className="create-media__button create-media__button--submit"
                style={{ display: 'none' }}
              />
            </Row>
          </div>
        </form>
      </div>
    );
  }
}

export default injectIntl(CreateMediaInput);
