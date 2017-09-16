import React, { Component } from 'react';
import { defineMessages, injectIntl, intlShape, FormattedMessage } from 'react-intl';
import Relay from 'react-relay';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import Card from 'material-ui/Card';
import SvgIcon from 'material-ui/SvgIcon';
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
import { FadeIn, ContentColumn, units, title, borderRadiusDefault, columnWidthMedium, white, black54, black87 } from '../../styles/js/shared';
import HttpStatus from '../../HttpStatus';

const StyledCreateMediaCard = styled(Card)`
  background-color: ${white};
  border-radius: ${borderRadiusDefault};
  margin: 0 auto ${units(2)};
  max-width: ${columnWidthMedium};
  padding: ${units(2)} ${units(1)};
  width: 100%;

  footer {
    align-items: top;
    display: flex;
  }

  .create-media__buttons {
    align-items: center;
    display: flex;
    justify-content: center;
    margin-left: auto;
    > button {
      color: ${black54},
    }
  }

  // The button to show the dropzone
  //
  .create-media__insert-photo {
    display: flex;
  }
`;

const StyledTitle = styled.div`
  color: ${black87};
  font: ${title};
  padding: 0 ${units(1)};
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
    };
  }

  componentDidMount() {
    this.mediaInput.focus();
  }

  onImage(file) {
    this.setState({ message: null });
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

  handleChange(e) {
    this.setState({ message: null });
  }

  handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      this.handleSubmit(e);
    }
  }

  handlePreview() {
    const url = document.getElementById('create-media-input').value;
    this.setState({ url, message: null });
  }

  handleSubmitError(context, prefix, transactionError) {
    let message = this.props.intl.formatMessage(messages.error, { code: `${transactionError.status} ${HttpStatus.getMessage(transactionError.status)}` });
    let json = null;
    try {
      json = JSON.parse(transactionError.source);
    } catch (e) {
      // do nothing
    }
    if (json && json.error) {
      const matches = json.error.match(
        this.state.mode === 'source' ?
          /Account with this URL exists and has source id ([0-9]+)$/ :
          /This media already exists in this project and has id ([0-9]+)/,
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

    if (this.state.mode === 'image') {
      image = document.forms.media.image;
      if (!image || this.state.isSubmitting) {
        return;
      }
    } else {
      inputValue = document.getElementById('create-media-input').value.trim();
      urls = inputValue.match(urlRegex());
      url = urls && urls[0] ? urls[0] : '';
      if (!inputValue || !inputValue.length || this.state.isSubmitting) {
        return;
      }
      if (!url.length || inputValue !== url) {
        // if anything other than a single url
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
      return <FormattedMessage id="createMedia.quoteTitle" defaultMessage="Add a quote" />;
    default:
      return null;
    }
  }

  renderFormInputs() {
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
          fullWidth
          id="create-media-source-name-input"
          multiLine
          onKeyPress={this.handleKeyPress.bind(this)}
          onChange={this.handleChange.bind(this)}
          onFocus={this.handleChange.bind(this)}
          ref={input => (this.mediaInput = input)}
        />,
        <TextField
          key="createMedia.source.url"
          hintText={this.props.intl.formatMessage(messages.sourceUrlInput)}
          fullWidth
          id="create-media-source-url-input"
          multiLine
          onKeyPress={this.handleKeyPress.bind(this)}
          onChange={this.handleChange.bind(this)}
          onFocus={this.handleChange.bind(this)}
          ref={input => (this.mediaInput = input)}
        />,
      ];
    case 'link':
    case 'quote':
    default:
      return [
        <TextField
          key="createMedia.quote.input"
          hintText={this.props.intl.formatMessage(messages.mediaInput)}
          fullWidth
          name="url"
          id="create-media-input"
          multiLine
          onKeyPress={this.handleKeyPress.bind(this)}
          onChange={this.handleChange.bind(this)}
          onFocus={this.handleChange.bind(this)}
          ref={input => (this.mediaInput = input)}
        />,
      ];
    }
  }

  render() {
    const isPreviewingUrl = this.state.url !== '';

    return (
      <FadeIn>
        <StyledCreateMediaCard className="create-media">
          <StyledTitle>{this.renderTitle()}</StyledTitle>
          <Message message={this.state.message} />
          <ContentColumn>
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

              <footer>
                <div className="create-media__buttons">
                  <IconButton
                    id="create-media__link"
                    onClick={this.setMode.bind(this, 'link')}
                  >
                    <IconLink />
                  </IconButton>
                  <IconButton
                    id="create-media__quote"
                    onClick={this.setMode.bind(this, 'quote')}
                    style={{ fontSize: units(3) }}
                  >
                    <SvgIcon>
                      <MdFormatQuote />
                    </SvgIcon>
                  </IconButton>
                  <IconButton
                    id="create-media__source"
                    onClick={this.setMode.bind(this, 'source')}
                    style={{ fontSize: units(3) }}
                  >
                    <SvgIcon>
                      <FaFeed />
                    </SvgIcon>
                  </IconButton>
                  <IconButton
                    id="create-media__image"
                    onClick={this.setMode.bind(this, 'image')}
                  >
                    <IconInsertPhoto />
                  </IconButton>
                  <FlatButton
                    id="create-media-submit"
                    primary
                    onClick={this.handleSubmit.bind(this)}
                    label={this.props.intl.formatMessage(messages.submitButton)}
                    className="create-media__button create-media__button--submit"
                  />
                </div>
              </footer>
            </form>
          </ContentColumn>
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
