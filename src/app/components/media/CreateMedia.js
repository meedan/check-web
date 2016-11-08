import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import FlatButton from 'material-ui/lib/flat-button';
import TextField from 'material-ui/lib/text-field';
import PenderCard from '../PenderCard';
import CreateMediaMutation from '../../relay/CreateMediaMutation';
import Message from '../Message';
import config from 'config';
import urlRegex from 'url-regex';

class CreateMedia extends Component {
  constructor(props) {
    super(props);

    this.state = {
      url: '',
      message: null,
      isSubmitting: false
    };
  }

  handleSubmit(event) {
    event.preventDefault();

    const that = this,
        inputValue = document.getElementById('create-media-input').value.trim(),
        prefix = '/project/' + Checkdesk.context.project.dbid + '/media/',
        urls = inputValue.match(urlRegex()),
        information = {},
        url = (urls && urls[0]) ? urls[0] : '';
    if (!inputValue || !inputValue.length || this.state.isSubmitting) { return; }
    this.setState({isSubmitting: true, message: 'Submitting...'});

    if (!url.length || inputValue !== url) { // if anything other than a single url
      information.quote = inputValue;
    }

    const handleError = (json) => {
      var message = 'Something went wrong! Try pasting the text of this post instead, or adding a different link.';
      if (json && json.error) {
        message = json.error;
        var matches = message.match(/^Validation failed: Media with this URL exists and has id ([0-9]+)$/);
        if (matches) {
          that.props.projectComponent.props.relay.forceFetch();
          var sid = matches[1];
          message = null;
          Checkdesk.history.push(prefix + sid);
        }
      }
      that.setState({ message: message, isSubmitting: false });
    }

    var onFailure = (transaction) => {
      const transactionError = transaction.getError();
      transactionError.json ? transactionError.json().then(handleError) : handleError(JSON.stringify(transactionError));
    };

    var onSuccess = (response) => {
      var rid = response.createMedia.media.dbid;
      Checkdesk.history.push(prefix + rid);
      this.setState({ message: null, isSubmitting: false });
    };

    Relay.Store.commitUpdate(
      new CreateMediaMutation({
        url: url,
        information: JSON.stringify(information),
        project: Checkdesk.context.project
      }),
      { onSuccess, onFailure }
    );
  }

  handlePreview() {
    var url = document.getElementById('create-media-input').value;
    this.setState({ url: url, message: null });
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
        <div id="media-preview" className="create-media__preview">
          {isPreviewingUrl ? <PenderCard url={this.state.url} penderUrl={config.penderUrl} /> : null}
        </div>

        <form id="media-url-container" className="create-media__form" onSubmit={this.handleSubmit.bind(this)}>
          <button className="create-media__button create-media__button--new">+</button>
          <TextField hintText="Paste a link or start typing to add a quote."
                     fullWidth={true}
                     name="url" id="create-media-input"
                     className='create-media__input'
                     multiLine={true}
                     onKeyPress={this.handleKeyPress.bind(this)}
                     ref={(input) => this.mediaInput = input} />
          <div className="create-media__buttons">
            <FlatButton id="create-media-submit" primary={true} onClick={this.handleSubmit.bind(this)} label="Post" className='create-media__button create-media__button--submit' />
          </div>
        </form>
      </div>
    );
  }
}

export default CreateMedia;
