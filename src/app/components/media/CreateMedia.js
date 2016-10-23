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
      message: null
    };
  }

  handleSubmit() {
    const that = this,
        inputValue = document.getElementById('create-media-input').value.trim(),
        prefix = '/project/' + Checkdesk.context.project.dbid + '/media/',
        urls = inputValue.match(urlRegex()),
        information = {},
        url = (urls && urls[0]) ? urls[0] : '';
    if (!url.length || inputValue !== url) { // if anything other than a single url
      information.quote = inputValue;
    }

    const handleError = (json) => {
      var message = 'Sorry, could not create the media';
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
      that.setState({ message: message });
    }

    var onFailure = (transaction) => {
      const transactionError = transaction.getError();
      transactionError.json ? transactionError.json().then(handleError) : handleError(JSON.stringify(transactionError));
    };

    var onSuccess = (response) => {
      var rid = response.createMedia.media.dbid;
      Checkdesk.history.push(prefix + rid);
      this.setState({ message: null });
    };

    Relay.Store.commitUpdate(
      new CreateMediaMutation({
        url: url,
        // information: JSON.stringify(information),
        project: Checkdesk.context.project
      }),
      { onSuccess, onFailure }
    );
  }

  handlePreview() {
    var url = document.getElementById('create-media-input').value;
    this.setState({ url: url, message: null });
  }

  render() {
    const isPreviewingUrl = (this.state.url !== '');

    return (
      <div className="create-media">
        <Message message={this.state.message} />
        <div id="media-preview" className="create-media__preview">
          {isPreviewingUrl ? <PenderCard url={this.state.url} penderUrl={config.penderUrl} /> : null}
        </div>

        <div id="media-url-container" className="create-media__form">
          <button className="create-media__button create-media__button--new">+</button>
          <TextField hintText="Paste a Twitter, Instagram, Facebook or YouTube link" fullWidth={true} name="url" id="create-media-input" className='create-media__input' />
          <div className="create-media__buttons">
            <FlatButton id="create-media-preview" secondary={true} onClick={this.handlePreview.bind(this)} label="Preview" className='create-media__button create-media__button--preview' />
            <FlatButton id="create-media-submit" primary={true} onClick={this.handleSubmit.bind(this)} label="Post" className='create-media__button create-media__button--submit' />
          </div>
        </div>
      </div>
    );
  }
}

export default CreateMedia;
