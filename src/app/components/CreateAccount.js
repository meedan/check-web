import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import PenderCard from './PenderCard';
import CreateAccountMutation from '../relay/CreateAccountMutation';
import Message from './Message';
import CheckContext from '../CheckContext';
import config from 'config';

class CreateAccount extends Component {
  constructor(props) {
    super(props);

    this.state = {
      url: '',
      message: null
    };
  }

  handleSubmit(redirect) {
    var that = this,
        url = document.getElementById('create-account-url').value,
        prefix = '/source/',
        history = new CheckContext(this).getContextStore().history;

    var onFailure = (transaction) => {
      let error = transaction.getError();
      let message = 'Sorry, could not create the source';
      try {
        let json = JSON.parse(error.source);
        if (json.error) {
          message = json.error;
          var matches = message.match(/^Validation failed: Account with this URL exists and has source id ([0-9]+)$/);
          if (matches) {
            var sid = matches[1];
            message = null;
            history.push(prefix + sid);
          }
        }
      } catch (e) { }
      that.setState({ message: message });
    };

    var onSuccess = (response) => {
      var sid = response.createAccount.account.source_id;
      history.push(prefix + sid);
      this.setState({ message: null });
    };

    Relay.Store.commitUpdate(
      new CreateAccountMutation({
        url: url
      }),
      { onSuccess, onFailure }
    );
  }

  handlePreview() {
    var url = document.getElementById('create-account-url').value;
    this.setState({ url: url, message: null });
  }

  render() {
    return (
      <div className="create-account">
        <Message message={this.state.message} />

        <div id="account-url-container" className="create-account-col">
          <h4>Create a source</h4>
          <h2>Source URL</h2>
          <TextField hintText="Twitter, Facebook, YouTube..." fullWidth={true} name="url" id="create-account-url" /><br />
          <FlatButton id="create-account-submit" primary={true} onClick={this.handleSubmit.bind(this)} label="Create" />
        </div>

        <div id="account-preview" className="create-account-col">
          <h4>Preview</h4>

          {(() => {
            if (this.state.url != '') {
              return (<PenderCard url={this.state.url} penderUrl={config.penderUrl} />);
            }
          })()}
        </div>
      </div>
    );
  }
}

CreateAccount.contextTypes = {
  store: React.PropTypes.object
};

export default CreateAccount;
