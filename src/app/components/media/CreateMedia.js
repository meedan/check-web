import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import FlatButton from 'material-ui/lib/flat-button';
import TextField from 'material-ui/lib/text-field';
import PenderCard from '../PenderCard';
import CreateMediaMutation from '../../relay/CreateMediaMutation';
import Message from '../Message';
import config from 'config';

class CreateMedia extends Component {
  constructor(props) {
    super(props);

    this.state = {
      url: '',
      message: null
    };
  }

  handleSubmit(redirect) {
    var that = this,
        url = document.getElementById('create-media-url').value;

    var onFailure = (transaction) => {
      transaction.getError().json().then(function(json) {
        var message = 'Sorry, could not create the media';
        if (json.error) {
          message = json.error;
          var matches = message.match(/^Validation failed: Media with this URL exists and has id ([0-9]+)$/);
          if (matches) {
            var sid = matches[1];
            message = null;
            that.props.history.push('/media/' + sid);
          }
        }
        that.setState({ message: message });
      });
    };

    var onSuccess = (response) => {
      var rid = response.createMedia.media.dbid;
      this.props.history.push('/media/' + rid);
      this.setState({ message: null });
    };

    Relay.Store.commitUpdate(
      new CreateMediaMutation({
        url: url,
        project: Checkdesk.currentProject
      }),
      { onSuccess, onFailure }
    );
  }

  handlePreview() {
    var url = document.getElementById('create-media-url').value;
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
          <TextField hintText="Paste a link to unverified media..." fullWidth={true} name="url" id="create-media-url" className='create-media__input' />
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
