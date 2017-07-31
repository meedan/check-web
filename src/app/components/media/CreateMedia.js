import React, { Component } from 'react';
import { defineMessages, injectIntl, intlShape, FormattedMessage } from 'react-intl';
import Relay from 'react-relay';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import MdInsertPhoto from 'react-icons/lib/md/insert-photo';
import MdInsertLink from 'react-icons/lib/md/insert-link';
import FaFeed from 'react-icons/lib/fa/feed';
import MdFormatQuote from 'react-icons/lib/md/format-quote';
import config from 'config';
import urlRegex from 'url-regex';
import MappedMessage from '../MappedMessage';
import UploadImage from '../UploadImage';
import PenderCard from '../PenderCard';
import CreateProjectMediaMutation from '../../relay/CreateProjectMediaMutation';
import CreateProjectSourceMutation from '../../relay/CreateProjectSourceMutation';
import Message from '../Message';
import CheckContext from '../../CheckContext';
import ContentColumn from '../layout/ContentColumn';

const messages = defineMessages({
  submitting: {
    id: 'createMedia.submitting',
    defaultMessage: 'Submitting...',
  },
  error: {
    id: 'createMedia.error',
    defaultMessage:
      'Something went wrong! Try pasting the text of this post instead, or adding a different link.',
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
  helper: {
    id: 'createMedia.helper',
    defaultMessage: 'Add a link, quote or image for verification',
  },
  bridge_helper: {
    id: 'bridge.createMedia.helper',
    defaultMessage: 'Add a link, quote or image for translation',
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
    window.addEventListener('mousedown', this.handleClickOutside.bind(this), false);
  }

  onImage(file) {
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

  handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      this.handleSubmit(e);
    }
  }

  handleClickOutside() {
    this.setState({ message: null });
  }

  handlePreview() {
    const url = document.getElementById('create-media-input').value;
    this.setState({ url, message: null });
  }

  submitSource() {
    const that = this;
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

    const handleError = (json) => {
      let message = this.props.intl.formatMessage(messages.error); // TODO: review error message
      if (json && json.error) {
        const matches = json.error.match(
          /Account with this URL exists and has source id ([0-9]+)$/,
        );
        if (matches) {
          that.props.projectComponent.props.relay.forceFetch();
          const psid = matches[1];
          message = null;
          context.history.push(prefix + psid);
        } else {
          message = json.error;
        }
      }
      that.setState({ message, isSubmitting: false });
    };

    const onFailure = (transaction) => {
      const transactionError = transaction.getError();
      try {
        handleError(JSON.parse(transactionError.source));
      } catch (e) {
        handleError(JSON.stringify(transactionError));
      }
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
    const that = this;
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

    const handleError = (json) => {
      let message = this.props.intl.formatMessage(messages.error);
      if (json && json.error) {
        const matches = json.error.match(
          /This media already exists in this project and has id ([0-9]+)/,
        );
        if (matches) {
          that.props.projectComponent.props.relay.forceFetch();
          const pmid = matches[1];
          message = null;
          context.history.push(prefix + pmid);
        } else {
          message = json.error;
        }
      }
      that.setState({ message, isSubmitting: false });
    };

    const onFailure = (transaction) => {
      const transactionError = transaction.getError();
      try {
        handleError(JSON.parse(transactionError.source));
      } catch (e) {
        handleError(JSON.stringify(transactionError));
      }
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
        <div className="create-media__helper" key="createMedia.media.helper">
          <MappedMessage msgObj={messages} msgKey="helper" />
        </div>,
      ];
    case 'source':
      return [
        <TextField
          key="createMedia.source.name"
          hintText={this.props.intl.formatMessage(messages.sourceInput)}
          fullWidth
          id="create-media-source-name-input"
          className="create-media__input"
          multiLine
          onKeyPress={this.handleKeyPress.bind(this)}
          ref={input => (this.mediaInput = input)}
        />,
        <TextField
          key="createMedia.source.url"
          hintText={this.props.intl.formatMessage(messages.sourceUrlInput)}
          fullWidth
          id="create-media-source-url-input"
          className="create-media__input"
          multiLine
          onKeyPress={this.handleKeyPress.bind(this)}
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
          className="create-media__input"
          multiLine
          onKeyPress={this.handleKeyPress.bind(this)}
          ref={input => (this.mediaInput = input)}
        />,
        <div key="createMedia.source.helper" className="create-media__helper">
          <MappedMessage msgObj={messages} msgKey="helper" />
        </div>,
      ];
    }
  }

  render() {
    const isPreviewingUrl = this.state.url !== '';

    return (
      <div className="create-media">
        <span className="create-media__title">{this.renderTitle()}</span>
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
                <div className="create-media__insert-photo">
                  <MdInsertLink
                    id="create-media__link"
                    title={this.props.intl.formatMessage(messages.uploadImage)}
                    className={this.state.fileMode ? 'create-media__file' : ''}
                    onClick={this.setMode.bind(this, 'link')}
                  />
                </div>
                <div className="create-media__insert-photo">
                  <MdFormatQuote
                    id="create-media__quote"
                    title={this.props.intl.formatMessage(messages.uploadImage)}
                    className={this.state.fileMode ? 'create-media__file' : ''}
                    onClick={this.setMode.bind(this, 'quote')}
                  />
                </div>
                <div className="create-media__insert-photo">
                  <FaFeed
                    id="create-media__source"
                    title={this.props.intl.formatMessage(messages.uploadImage)}
                    className={this.state.fileMode ? 'create-media__file' : ''}
                    onClick={this.setMode.bind(this, 'source')}
                  />
                </div>
                <div className="create-media__insert-photo">
                  <MdInsertPhoto
                    id="create-media__image"
                    title={this.props.intl.formatMessage(messages.uploadImage)}
                    className={this.state.fileMode ? 'create-media__file' : ''}
                    onClick={this.setMode.bind(this, 'image')}
                  />
                </div>
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
      </div>
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
