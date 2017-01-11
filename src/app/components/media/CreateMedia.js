import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
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
    };
  }

  handleSubmit(event) {
    event.preventDefault();

    const that = this,
      context = new CheckContext(this).getContextStore(),
      inputValue = document.getElementById('create-media-input').value.trim(),
      prefix = `/project/${context.project.dbid}/media/`,
      urls = inputValue.match(urlRegex()),
      url = (urls && urls[0]) ? urls[0] : '';

    let quote = '';

    if (!inputValue || !inputValue.length || this.state.isSubmitting) { return; }
    this.setState({ isSubmitting: true, message: 'Submitting...' });

    if (!url.length || inputValue !== url) { // if anything other than a single url
      quote = inputValue;
    }

    const handleError = (json) => {
      let message = 'Something went wrong! Try pasting the text of this post instead, or adding a different link.';
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
  }

  handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      this.handleSubmit(e);
    }
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

          <form id="media-url-container" className="create-media__form" onSubmit={this.handleSubmit.bind(this)}>
            <button className="create-media__button create-media__button--new">+</button>
            <TextField
              hintText="Paste a link or start typing to add a quote."
              fullWidth
              name="url" id="create-media-input"
              className="create-media__input"
              multiLine
              onKeyPress={this.handleKeyPress.bind(this)}
              ref={input => this.mediaInput = input}
            />
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
