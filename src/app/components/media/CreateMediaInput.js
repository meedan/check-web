import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import FlatButton from 'material-ui/FlatButton';
import SvgIcon from 'material-ui/SvgIcon';
import { Tabs, Tab } from 'material-ui/Tabs';
import TextField from 'material-ui/TextField';
import IconInsertPhoto from 'material-ui/svg-icons/editor/insert-photo';
import IconLink from 'material-ui/svg-icons/content/link';
import FaFeed from 'react-icons/lib/fa/feed';
import MdFormatQuote from 'react-icons/lib/md/format-quote';
import rtlDetect from 'rtl-detect';
import styled from 'styled-components';
import urlRegex from 'url-regex';
import AutoCompleteClaimAttribution from './AutoCompleteClaimAttribution';
import Message from '../Message';
import UploadImage from '../UploadImage';
import CheckContext from '../../CheckContext';
import { validateURL } from '../../helpers';
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
  padding: 0 ${units(0.5)};
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
    defaultMessage: 'Paste or type a claim',
  },
  quoteAttributionSourceInput: {
    id: 'createMedia.quoteAttributionSourceInput',
    defaultMessage: 'Source name',
  },
  quoteAttributionContextInput: {
    id: 'createMedia.quoteAttributionContext',
    defaultMessage: 'URL or context',
  },
  quoteAttributionSourceInputHelper: {
    id: 'createMedia.quoteAttributionSourceInputHelper',
    defaultMessage: 'Who said this?',
  },
  quoteAttributionContextInputHelper: {
    id: 'createMedia.quoteAttributionContextHelper',
    defaultMessage: 'Add URL or describe the content',
  },
  sourceInput: {
    id: 'createMedia.sourceInput',
    defaultMessage: 'Source name',
  },
  sourceUrlInput: {
    id: 'createMedia.sourceUrlInput',
    defaultMessage: 'Link to source',
  },
  uploadImage: {
    id: 'createMedia.uploadImage',
    defaultMessage: 'Upload an image',
  },
  submitButton: {
    id: 'createMedia.submitButton',
    defaultMessage: 'Post',
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
    let image = '';
    let inputValue = '';
    let urls = '';
    let url = '';
    let quote = '';
    let quoteAttributions = JSON.stringify({});

    if (this.state.mode === 'image') {
      ({ media: { image } } = document.forms);
      if (!image) {
        return null;
      }
    } else if (this.state.mode === 'video') {
      ({ media: { video } } = document.forms);
      if (!video) {
        return null;
      }
    } else if (this.state.mode === 'quote') {
      // TODO Use React ref
      quote = document.getElementById('create-media-quote-input').value.trim();
      quoteAttributions = JSON.stringify({
        name: document.getElementById('create-media-quote-attribution-source-input').value.trim(),
      });
    } else {
      // TODO Use React ref
      inputValue = document.getElementById('create-media-input').value.trim();
      urls = inputValue.match(urlRegex());
      url = urls && urls[0] ? urls[0] : '';
      if (!inputValue || !inputValue.length) {
        return null;
      }
      if (!url.length || inputValue !== url) {
        // if anything other than a single url, save it as a quote
        quote = inputValue;
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
        quoteAttributions,
        image,
        video,
        title,
        mode: this.state.mode,
      });
    }

    return null;
  };

  getSourceInputValue = () => {
    const inputValue = document.getElementById('create-media-source-name-input').value.trim();
    const url = document.getElementById('create-media-source-url-input').value.trim();

    if (url && !validateURL(url)) {
      this.setState({ message: this.props.intl.formatMessage(messages.invalidUrl) });
      return null;
    }

    if (inputValue || url) {
      return ({
        source_name: inputValue,
        source_url: url,
        mode: 'source',
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
    const value = this.state.mode === 'source' ?
      this.getSourceInputValue() : this.getMediaInputValue();

    this.resetForm();

    if (this.props.onSubmit) {
      this.props.onSubmit(value);
    }
  };

  handleTabChange = (mode) => {
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

  handleChange = () => {
    this.setState({
      previousInput: this.primaryInput ? this.primaryInput.getValue() : this.state.previousInput,
      message: null,
      submittable: (this.primaryInput && this.primaryInput.getValue().length > 0) ||
                   (this.secondaryInput && this.secondaryInput.getValue().length > 0),
    });
  };

  resetForm() {
    // TODO Use React refs
    ['create-media-quote-input', 'create-media-quote-attribution-source-input', 'create-media-input']
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
    };

    const context = new CheckContext(this).getContextStore();

    switch (this.state.mode) {
    case 'image':
      return [
        <UploadImage
          key="createMedia.image.upload"
          onImage={this.handleImage}
          onError={this.handleImageError}
        />,
      ];
    case 'video':
      return [
        <UploadImage
          key="createMedia.video.upload"
          onImage={this.handleVideo}
          onError={this.handleImageError}
        />,
      ];
    case 'source':
      return [
        <TextField
          key="createMedia.source.name"
          hintText={this.props.intl.formatMessage(messages.sourceInput)}
          id="create-media-source-name-input"
          ref={(input) => { this.primaryInput = input; }}
          defaultValue={this.state.previousInput}
          autoFocus
          {...defaultInputProps}
        />,
        <TextField
          key="createMedia.source.url"
          hintText={this.props.intl.formatMessage(messages.sourceUrlInput)}
          id="create-media-source-url-input"
          ref={(input) => { this.secondaryInput = input; }}
          {...defaultInputProps}
        />,
      ];
    case 'quote': {
      return [
        <TextField
          key="createMedia.quote.input"
          hintText={this.props.intl.formatMessage(messages.quoteInput)}
          name="quote"
          id="create-media-quote-input"
          ref={(input) => { this.primaryInput = input; }}
          defaultValue={this.state.previousInput}
          autoFocus
          {...defaultInputProps}
        />,
        <AutoCompleteClaimAttribution
          key="createMedia.source.input"
          team={context.team}
          hintText={this.props.intl.formatMessage(messages.quoteAttributionSourceInput)}
          inputProps={defaultInputProps}
        />,
      ];
    }
    case 'link':
    default:
      return [
        <TextField
          key="createMedia.media.input"
          hintText={this.props.intl.formatMessage(messages.mediaInput)}
          name="url"
          id="create-media-input"
          ref={(input) => { this.primaryInput = input; }}
          defaultValue={this.state.previousInput}
          autoFocus
          {...defaultInputProps}
        />,
      ];
    }
  }

  render() {
    const isRtl = rtlDetect.isRtlLang(this.props.intl.locale);

    const styles = {
      svgIcon: {
        fontSize: units(3),
      },
      tab: {
        margin: isRtl ? `0 0 0 ${units(2)}` : `0 ${units(2)} 0 0`,
      },
      submitButton: {
        margin: isRtl ? '0 auto 0 0' : '0 0 0 auto',
        display: this.props.submitHidden ? 'none' : null,
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
          <FormattedMessage id="createMedia.quote" defaultMessage="Claim" />
        </StyledTabLabelText>
      </StyledTabLabel>
    );

    const tabLabelSource = (
      <StyledTabLabel active={this.state.mode === 'source'}>
        <StyledIcon><SvgIcon style={styles.svgIcon}><FaFeed /></SvgIcon></StyledIcon>
        <StyledTabLabelText>
          <FormattedMessage id="createMedia.source" defaultMessage="Source" />
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
        <StyledIcon><IconInsertPhoto /></StyledIcon>
        <StyledTabLabelText>
          <FormattedMessage id="createMedia.video" defaultMessage="Video" />
        </StyledTabLabelText>
      </StyledTabLabel>
    );

    const defaultTabProps = {
      buttonStyle: { height: units(3) },
      style: styles.tab,
    };

    return (
      <div>
        <Message message={this.props.message || this.state.message} />

        <form
          name="media"
          id="media-url-container"
          className="create-media__form"
          onSubmit={this.handleSubmit}
        >
          <div id="create-media__field">
            {this.renderFormInputs()}
          </div>

          <div style={{ marginTop: units(2), width: '100%' }}>
            <Row style={{ flexWrap: 'wrap' }}>
              <Tabs value={this.state.mode} onChange={this.handleTabChange} inkBarStyle={{ display: 'none' }}>
                <Tab
                  id="create-media__link"
                  value="link"
                  label={tabLabelLink}
                  {...defaultTabProps}
                />
                <Tab
                  id="create-media__quote"
                  value="quote"
                  label={tabLabelQuote}
                  {...defaultTabProps}
                />
                { this.props.noSource ?
                  null :
                  <Tab
                    id="create-media__source"
                    value="source"
                    label={tabLabelSource}
                    {...defaultTabProps}
                  />
                }
                <Tab
                  id="create-media__image"
                  value="image"
                  label={tabLabelImage}
                  {...defaultTabProps}
                />
                <Tab
                  id="create-media__video"
                  value="video"
                  label={tabLabelVideo}
                  {...defaultTabProps}
                />
              </Tabs>
              <FlatButton
                id="create-media-submit"
                primary
                disabled={!this.state.submittable}
                onClick={this.handleSubmit}
                label={this.props.intl.formatMessage(messages.submitButton)}
                className="create-media__button create-media__button--submit"
                style={styles.submitButton}
              />
            </Row>
          </div>
        </form>
      </div>
    );
  }
}

CreateMediaInput.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(CreateMediaInput);
