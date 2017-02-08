import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
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
      message: null,
    };
  }

  handleSubmit(redirect) {
    let that = this,
      url = document.getElementById('create-account-url').value,
      prefix = '/check/source/',
      history = new CheckContext(this).getContextStore().history;

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = 'Sorry, could not create the source';
      try {
        const json = JSON.parse(error.source);
        if (json.error) {
          message = json.error;
          const matches = message.match(/^Validation failed: Account with this URL exists and has source id ([0-9]+)$/);
          if (matches) {
            const sid = matches[1];
            message = null;
            history.push(prefix + sid);
          }
        }
      } catch (e) { }
      that.setState({ message });
    };

    const onSuccess = (response) => {
      const sid = response.createAccount.account.source_id;
      history.push(prefix + sid);
      this.setState({ message: null });
    };

    Relay.Store.commitUpdate(
      new CreateAccountMutation({
        url,
      }),
      { onSuccess, onFailure },
    );
  }

  handlePreview() {
    const url = document.getElementById('create-account-url').value;
    this.setState({ url, message: null });
  }

  render() {
    return (
      <div className="create-account">
        <Message message={this.state.message} />

        <div id="account-url-container" className="create-account-col">
          <h4><FormattedMessage id="createAccount.createSource" defaultMessage="Create a source" /></h4>
          <h2><FormattedMessage id="createAccount.sourceUrl" defaultMessage="Source URL" /></h2>
          <TextField hintText="Twitter, Facebook, YouTube..." fullWidth name="url" id="create-account-url" /><br />
          <FlatButton id="create-account-submit" primary onClick={this.handleSubmit.bind(this)} label="Create" />
        </div>

        <div id="account-preview" className="create-account-col">
          <h4><FormattedMessage id="createAccount.preview" defaultMessage="Preview" /></h4>

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
  store: React.PropTypes.object,
};

export default CreateAccount;
