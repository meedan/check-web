import React, { Component } from 'react';
import { defineMessages, injectIntl, intlShape, FormattedMessage } from 'react-intl';
import Relay from 'react-relay';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import rtlDetect from 'rtl-detect';
import { Card, CardText, CardHeader } from 'material-ui/Card';
import SvgIcon from 'material-ui/SvgIcon';
import { Tabs, Tab } from 'material-ui/Tabs';
import AutoComplete from 'material-ui/AutoComplete';
import IconInsertPhoto from 'material-ui/svg-icons/editor/insert-photo';
import IconLink from 'material-ui/svg-icons/content/link';
import FaFeed from 'react-icons/lib/fa/feed';
import MdFormatQuote from 'react-icons/lib/md/format-quote';
import styled from 'styled-components';
import config from 'config';
import urlRegex from 'url-regex';
import UploadImage from '../UploadImage';
import PenderCard from '../PenderCard';
import CreateProjectMediaMutation from '../../relay/CreateProjectMediaMutation';
import CreateProjectSourceMutation from '../../relay/CreateProjectSourceMutation';
import Message from '../Message';
import CheckContext from '../../CheckContext';
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
import HttpStatus from '../../HttpStatus';

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
});

class CreateProjectMedia extends Component {
  constructor(props) {
    super(props);

    this.state = {
      url: '',
      message: null,
      isSubmitting: false,
      fileMode: false,
      mode: 'link',
      submittable: false,
    };
  }

  componentDidMount() {
    this.mediaInput.focus();
  }

  onImage(file) {
    this.setState({ message: null, submittable: true });
    document.forms.media.image = file;
  }

  onImageError(file, message) {
    this.setState({ message });
  }

  setMode(mode) {
    this.setState({ mode });
  }

  switchMode() {
    this.setState({ fileMode: !this.state.fileMode });
  }

  handleChange() {
    this.setState({ message: null });
  }

  handleKeyPress(e) {
    this.setState({ submittable: true });
    if (e.key === 'Enter' && !e.shiftKey) {
      this.handleSubmit(e);
    }
  }

  handleSubmitError(context, prefix, transactionError) {
    let message = this.props.intl.formatMessage(messages.error, {
      code: `${transactionError.status} ${HttpStatus.getMessage(transactionError.status)}`,
    });
    let json = null;
    try {
      json = JSON.parse(transactionError.source);
    } catch (e) {
      // do nothing
    }
    if (json && json.error) {
      const matches = json.error.match(
        this.state.mode === 'source'
          ? /Account with this URL exists and has source id ([0-9]+)$/
          : /This media already exists in this project and has id ([0-9]+)/,
      );
      if (matches) {
        this.props.projectComponent.props.relay.forceFetch();
        const pxid = matches[1];
        message = null;
        context.history.push(prefix + pxid);
      } else {
        message = json.error;
      }
    }
    this.setState({ message, isSubmitting: false });
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
      const rid = response.createProjectSource.project_source.source.dbid;
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
    let quoteAttributions = '';

    if (this.state.mode === 'image') {
      image = document.forms.media.image;
      if (!image || this.state.isSubmitting) {
        return;
      }
    } else if (this.state.mode === 'quote') {
      quote = document.getElementById('create-media-quote-input').value.trim();
      quoteAttributions = JSON.stringify({
        name: document.getElementById('create-media-quote-attribution-source-input').value.trim(),
        // TODO: support attribution context
        //
        // context: document.getElementById('create-media-quote-attribution-context-input').value.trim(),
      });
    } else {
      inputValue = document.getElementById('create-media-input').value.trim();
      urls = inputValue.match(urlRegex());
      url = urls && urls[0] ? urls[0] : '';
      if (!inputValue || !inputValue.length || this.state.isSubmitting) {
        return;
      }
      if (!url.length || inputValue !== url) {
        // if anything other than a single url, save it as a quote
        quote = inputValue;
      }
    }

    this.setState({
      isSubmitting: true,
      message: this.props.intl.formatMessage(messages.submitting),
    });

    const onFailure = (transaction) => {
      this.handleSubmitError(context, prefix, transaction.getError());
    };

    const onSuccess = (response) => {
      const rid = response.createProjectMedia.project_media.dbid;
      context.history.push(prefix + rid);
      this.setState({ message: null, isSubmitting: false });
    };

    Relay.Store.commitUpdate(
      new CreateProjectMediaMutation({
        url,
        quote,
        quoteAttributions,
        image,
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
      onFocus: this.handleChange.bind(this),
      ref: input => (this.mediaInput = input),
    };

    switch (this.state.mode) {
    case 'image':
      return [
        <UploadImage
          key="createMedia.image.upload"
          onImage={this.onImage.bind(this)}
          onError={this.onImageError.bind(this)}
        />,
      ];
    case 'source':
      return [
        <TextField
          key="createMedia.source.name"
          hintText={this.props.intl.formatMessage(messages.sourceInput)}
          id="create-media-source-name-input"
          {...defaultInputProps}
        />,
        <TextField
          key="createMedia.source.url"
          hintText={this.props.intl.formatMessage(messages.sourceUrlInput)}
          id="create-media-source-url-input"
          {...defaultInputProps}
        />,
      ];
    case 'quote': {
      const context = new CheckContext(this).getContextStore();
      return [
        <TextField
          key="createMedia.quote.input"
          floatingLabelText={this.props.intl.formatMessage(messages.quoteInput)}
          name="quote"
          id="create-media-quote-input"
          {...defaultInputProps}
        />,
        <AutoComplete
          key="createMedia.quoteAttributionSource.input"
          id="create-media-quote-attribution-source-input"
          name="quoteAttributionSource"
          filter={AutoComplete.fuzzyFilter}
          floatingLabelText={this.props.intl.formatMessage(messages.quoteAttributionSourceInput)}
          dataSource={context.team.sources.edges.map(obj => obj.node.name)}
          //
          // TODO: implement real sources instead of these ^
          //
          // The following props might be useful:
          //
          // errorText={}
          // dataSourceConfig={{ text: 'label', value: 'value' }}
          // openOnFocus
          // onNewRequest={}
          // ref={'autocomplete'}
          hintText={this.props.intl.formatMessage(messages.quoteAttributionSourceInputHelper)}
          {...defaultInputProps}
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
          {...defaultInputProps}
        />,
      ];
    }
  }

  render() {
    const isPreviewingUrl = this.state.url !== '';
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
        <StyledTabLabelText><FormattedMessage id="createMedia.link" defaultMessage="Link" /></StyledTabLabelText>
      </StyledTabLabel>
    );

    const tabLabelQuote = (
      <StyledTabLabel active={this.state.mode === 'quote'}>
        <StyledIcon><SvgIcon style={styles.svgIcon}><MdFormatQuote /></SvgIcon></StyledIcon>
        <StyledTabLabelText><FormattedMessage id="createMedia.quote" defaultMessage="Claim" /></StyledTabLabelText>
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
        <StyledTabLabelText><FormattedMessage id="createMedia.image" defaultMessage="Photo" /></StyledTabLabelText>
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
            <div id="media-preview" className="create-media__preview">
              {isPreviewingUrl
                ? <PenderCard url={this.state.url} penderUrl={config.penderUrl} />
                : null}
            </div>

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
  intl: intlShape.isRequired,
};

CreateProjectMedia.contextTypes = {
  store: React.PropTypes.object,
};

export default injectIntl(CreateProjectMedia);
