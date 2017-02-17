import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import Dropzone from 'react-dropzone';
import FontAwesome from 'react-fontawesome';
import UploadImage from '../UploadImage';
import PenderCard from '../PenderCard';
import CreateProjectMediaMutation from '../../relay/CreateProjectMediaMutation';
import Message from '../Message';
import CheckContext from '../../CheckContext';
import config from 'config';
import urlRegex from 'url-regex';
import ContentColumn from '../layout/ContentColumn';

class CreateProjectMedia extends Component {
  constructor(props) {
    super(props);

    this.state = {
      url: '',
      message: null,
      isSubmitting: false,
      fileMode: false
    };
  }

  handleSubmit(event) {
    event.preventDefault();

    const that = this,
      context = new CheckContext(this).getContextStore(),
      prefix = `/${context.team.slug}/project/${context.project.dbid}/media/`;

    let image = '',
        inputValue = '',
        urls = '',
        url = '',
        quote = '';

    if (this.state.fileMode) {
      image = document.forms.media.image;
      if (!image || this.state.isSubmitting) { return; }
    } else {
      inputValue = document.getElementById('create-media-input').value.trim(),
      urls = inputValue.match(urlRegex()),
      url = (urls && urls[0]) ? urls[0] : '';
      if (!inputValue || !inputValue.length || this.state.isSubmitting) { return; }
      if (!url.length || inputValue !== url) { // if anything other than a single url
        quote = inputValue;
      }
    }

    this.setState({ isSubmitting: true, message: 'Submitting...' });

    const handleError = (json) => {
      let message = 'Something went wrong! Try pasting the text of this post instead, or adding a different link. <b id="close-message">✖</b>';
      if (json && json.error) {
        const matches = json.error.match(/^Validation failed: This media already exists in this project and has id ([0-9]+)$/);
        if (matches) {
          that.props.projectComponent.props.relay.forceFetch();
          const pmid = matches[1];
          message = null;
          context.history.push(prefix + pmid);
        }
      }
      that.setState({ message, isSubmitting: false });
    };

    const onFailure = (transaction) => {
      const transactionError = transaction.getError();
      try {
        const json = JSON.parse(transactionError.source);
        handleError(json);
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

  handlePreview() {
    const url = document.getElementById('create-media-input').value;
    this.setState({ url, message: null });
  }

  componentDidMount() {
    this.mediaInput.focus();
    window.addEventListener('mousedown', this.handleClickOutside.bind(this), false);
  }

  handleClickOutside(e) {
    this.setState({ message: null });
  }

  handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      this.handleSubmit(e);
    }
  }

  onImage(file) {
    document.forms.media.image = file;
  }

  switchMode() {
    this.setState({ fileMode: !this.state.fileMode });
  }

  render() {
    const isPreviewingUrl = (this.state.url !== '');

    return (
      <div className="create-media">
        <Message message={this.state.message} />
        <ContentColumn>
          <div id="media-preview" className="create-media__preview">
            {isPreviewingUrl ? <PenderCard url={this.state.url} penderUrl={config.penderUrl} /> : null}
          </div>

          <form name="media" id="media-url-container" className="create-media__form" onSubmit={this.handleSubmit.bind(this)}>
            <button className="create-media__button create-media__button--new">+</button>

            <div id="create-media__field">
              {(() => {
                if (this.state.fileMode) {
                  return (
                    <UploadImage onImage={this.onImage.bind(this)} />
                  );
                } else {
                  return (
                    <TextField
                      hintText="Paste a link, type to add a quote or click on the icon to upload an image"
                      fullWidth
                      name="url" id="create-media-input"
                      className="create-media__input"
                      multiLine
                      onKeyPress={this.handleKeyPress.bind(this)}
                      ref={input => this.mediaInput = input}
                    />
                  );
                }
              })()}
              <FontAwesome id="create-media__switcher" size="2x" title="Upload an image" name="picture-o" className={this.state.fileMode ? 'create-media__file' : ''} onClick={this.switchMode.bind(this)} />
            </div>

            <div className="create-media__buttons">
              <FlatButton id="create-media-submit" primary onClick={this.handleSubmit.bind(this)} label="Post" className="create-media__button create-media__button--submit" />
            </div>
          </form>
        </ContentColumn>
      </div>
    );
  }
}

CreateProjectMedia.contextTypes = {
  store: React.PropTypes.object,
};

export default CreateProjectMedia;
