import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape, FormattedMessage } from 'react-intl';
import Relay from 'react-relay';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import rtlDetect from 'rtl-detect';
import { Card, CardText, CardHeader } from 'material-ui/Card';
import SvgIcon from 'material-ui/SvgIcon';
import { Tabs, Tab } from 'material-ui/Tabs';
import IconInsertPhoto from 'material-ui/svg-icons/editor/insert-photo';
import IconLink from 'material-ui/svg-icons/content/link';
import FaFeed from 'react-icons/lib/fa/feed';
import MdFormatQuote from 'react-icons/lib/md/format-quote';
import styled from 'styled-components';
import urlRegex from 'url-regex';
import AutoCompleteClaimAttribution from './AutoCompleteClaimAttribution';
import UploadImage from '../UploadImage';
import CreateProjectMediaMutation from '../../relay/mutations/CreateProjectMediaMutation';
import CreateProjectSourceMutation from '../../relay/mutations/CreateProjectSourceMutation';
import Message from '../Message';
import CheckContext from '../../CheckContext';
import HttpStatus from '../../HttpStatus';
import { safelyParseJSON, hasFilters } from '../../helpers';
import {
  FadeIn,
  Row,
  units,
  caption,
  columnWidthMedium,
  black38,
  black54,
  black87,
  mediaQuery,
} from '../../styles/js/shared';

const tabHeight = units(3);

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

const StyledCreateMediaCard = styled(Card)`
  margin: 0 auto ${units(2)};
  max-width: ${columnWidthMedium};
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
  submitting: {
    id: 'createMedia.submitting',
    defaultMessage: 'Submitting...',
  },
  error: {
    id: 'createMedia.error',
    defaultMessage:
      'Something went wrong! The server returned an error code {code}. Please contact a system administrator.',
  },
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
  errorTitle: {
    id: 'createMedia.errorTitle',
    defaultMessage: 'Could not submit "{title}"',
  },
});

class CreateProjectMedia extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: null,
      mode: 'link',
      submittable: false,
      isSubmitting: false,
      previousInput: null,
    };
  }

  setMode(mode) {
    this.setState({ mode });
  }

  handleImage(file) {
    this.setState({ message: null, submittable: true });
    document.forms.media.image = file;
  }

  handleImageError(file, message) {
    this.setState({ message, submittable: false });
  }

  handleChange() {
    this.setState({
      previousInput: this.primaryInput ? this.primaryInput.getValue() : this.state.previousInput,
      message: null,
      submittable: (this.primaryInput && this.primaryInput.getValue().length > 0) ||
                   (this.secondaryInput && this.secondaryInput.getValue().length > 0),
    });
  }

  handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      this.handleSubmit(e);
    }
  }

  handleSubmitError(context, prefix, transactionError, title) {
    let message = this.props.intl.formatMessage(messages.error, {
      code: `${transactionError.status} ${HttpStatus.getMessage(transactionError.status)}`,
    });
    const json = safelyParseJSON(transactionError.source);
    if (json) {
      if (json.error_info && json.error_info.code === 'ERR_OBJECT_EXISTS') {
        message = null;
        context.history.push(`/${context.team.slug}/project/${json.error_info.project_id}/${json.error_info.type}/${json.error_info.id}`);
      } else {
        message = json.error;
      }
    }
    if (title) {
      message = [this.props.intl.formatMessage(messages.errorTitle, { title }), message];
      message = message.join('<br />');
    }
    this.setState({ message, isSubmitting: false, submittable: false });
  }

  resetForm() {
    // TODO Use React refs
    ['create-media-quote-input', 'create-media-quote-attribution-source-input', 'create-media-input'].forEach((id) => {
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
    this.setState({ previousInput: null });
  }

  submitSource() {
    const context = new CheckContext(this).getContextStore();
    const prefix = `/${context.team.slug}/project/${context.project.dbid}/source/`;
    const inputValue = document.getElementById('create-media-source-name-input').value.trim();
    const url = document.getElementById('create-media-source-url-input').value.trim();

    if ((!inputValue && !url) || (!inputValue.length && !url) || this.state.isSubmitting) {
      return;
    }

    this.setState({
      isSubmitting: true,
      message: this.props.intl.formatMessage(messages.submitting),
    });

    const onFailure = (transaction) => {
      this.handleSubmitError(context, prefix, transaction.getError());
    };

    const onSuccess = (response) => {
      const rid = response.createProjectSource.project_source.dbid;
      context.history.push(prefix + rid);
      this.setState({ message: null, isSubmitting: false });
    };

    Relay.Store.commitUpdate(
      new CreateProjectSourceMutation({
        source_name: inputValue,
        source_url: url,
        project: context.project,
      }),
      { onSuccess, onFailure },
    );
  }

  submitMedia() {
    const context = new CheckContext(this).getContextStore();
    const prefix = `/${context.team.slug}/project/${context.project.dbid}/media/`;

    let image = '';
    let inputValue = '';
    let urls = '';
    let url = '';
    let quote = '';
    let quoteAttributions = JSON.stringify({});

    if (this.state.mode === 'image') {
      ({ media: { image } } = document.forms);
      if (!image) {
        return;
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
        return;
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

    this.resetForm();

    const onFailure = (transaction) => {
      this.handleSubmitError(context, prefix, transaction.getError(), title);
    };

    const onSuccess = (response) => {
      if (hasFilters()) {
        const rid = response.createProjectMedia.project_media.dbid;
        context.history.push(prefix + rid);
      }
      this.setState({ message: null, isSubmitting: false });
    };

    Relay.Store.commitUpdate(
      new CreateProjectMediaMutation({
        url,
        quote,
        quoteAttributions,
        image,
        context,
        title,
        project: context.project,
      }),
      { onSuccess, onFailure },
    );
  }

  handleSubmit(event) {
    event.preventDefault();

    if (this.state.mode === 'source') {
      this.submitSource();
    } else {
      this.submitMedia();
    }
  }

  renderTitle() {
    switch (this.state.mode) {
    case 'image':
      return <FormattedMessage id="createMedia.imageTitle" defaultMessage="Upload a photo" />;
    case 'source':
      return <FormattedMessage id="createMedia.sourceTitle" defaultMessage="Add a source" />;
    case 'link':
      return <FormattedMessage id="createMedia.linkTitle" defaultMessage="Add a link" />;
    case 'quote':
      return <FormattedMessage id="createMedia.quoteTitle" defaultMessage="Add a claim" />;
    default:
      return null;
    }
  }

  renderFormInputs() {
    const defaultInputProps = {
      fullWidth: true,
      multiLine: true,
      onKeyPress: this.handleKeyPress.bind(this),
      onChange: this.handleChange.bind(this),
    };

    const context = new CheckContext(this).getContextStore();

    switch (this.state.mode) {
    case 'image':
      return [
        <UploadImage
          key="createMedia.image.upload"
          ref={(input) => { this.uploadImage = input; }}
          onImage={this.handleImage.bind(this)}
          onError={this.handleImageError.bind(this)}
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

    const defaultTabProps = {
      buttonStyle: { height: tabHeight },
      style: styles.tab,
    };

    return (
      <FadeIn>
        <StyledCreateMediaCard className="create-media">
          <CardHeader title={this.renderTitle()} />
          <CardText>
            <Message message={this.state.message} />

            <form
              name="media"
              id="media-url-container"
              className="create-media__form"
              onSubmit={this.handleSubmit.bind(this)}
            >
              <div id="create-media__field">
                {this.renderFormInputs()}
              </div>

              <div style={{ marginTop: units(2), width: '100%' }}>
                <Row style={{ flexWrap: 'wrap' }}>
                  <Tabs inkBarStyle={{ display: 'none' }}>
                    <Tab
                      id="create-media__link"
                      onClick={this.setMode.bind(this, 'link')}
                      label={tabLabelLink}
                      {...defaultTabProps}
                    />
                    <Tab
                      id="create-media__quote"
                      onClick={this.setMode.bind(this, 'quote')}
                      label={tabLabelQuote}
                      {...defaultTabProps}
                    />
                    <Tab
                      id="create-media__source"
                      onClick={this.setMode.bind(this, 'source')}
                      label={tabLabelSource}
                      {...defaultTabProps}
                    />
                    <Tab
                      id="create-media__image"
                      onClick={this.setMode.bind(this, 'image')}
                      label={tabLabelImage}
                      {...defaultTabProps}
                    />
                  </Tabs>
                  <FlatButton
                    id="create-media-submit"
                    primary
                    disabled={!this.state.submittable}
                    onClick={this.handleSubmit.bind(this)}
                    label={this.props.intl.formatMessage(messages.submitButton)}
                    className="create-media__button create-media__button--submit"
                    style={styles.submitButton}
                  />
                </Row>
              </div>
            </form>
          </CardText>
        </StyledCreateMediaCard>
      </FadeIn>
    );
  }
}

CreateProjectMedia.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

CreateProjectMedia.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(CreateProjectMedia);
