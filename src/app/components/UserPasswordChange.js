import React, { Component, PropTypes } from 'react';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import Relay from 'react-relay';
import { Link } from 'react-router';
import { Card, CardText, CardActions, CardTitle } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import ChangePasswordMutation from '../relay/ChangePasswordMutation';
import CheckContext from '../CheckContext';

const messages = defineMessages({
  newPassword: {
    id: 'passwordChange.newPassword',
    defaultMessage: 'New password',
  },
  confirmPassword: {
    id: 'passwordChange.confirmPassword',
    defaultMessage: 'Confirm password',
  },
  unmatchingPasswords: {
    id: 'passwordChange.unmatchingPasswords',
    defaultMessage: "Passwords didn't match",
  },
});

class UserPasswordChange extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showConfirmDialog: false,
      submitDisabled: true
    }
  }

  getQueryStringValue (key) {
    return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
  }

  getHistory() {
    const history = new CheckContext(this).getContextStore().history;
    return history;
  }

  handleSignIn() {
    const history = this.getHistory();
    history.push('/check/login/email');
  }

  handleChangePassword(e) {
    this.setState({ password: e.target.value });
  }

  handleChangePasswordConfirm(e) {
    this.setState({ password_confirmation: e.target.value }, this.canSubmit);
  }

  canSubmit() {
    const password = this.state.password;
    const password_confirmation = this.state.password_confirmation;
    const bothFilled = (!!password && !!password_confirmation);
    const sameSize = (password.length <= password_confirmation.length);
    const samePass = (password === password_confirmation);

    let errorMsg = '';

    if (bothFilled) {
        errorMsg = sameSize && !samePass ? this.props.intl.formatMessage(messages.unmatchingPasswords) : '';
    }

    this.setState({ errorMsg, submitDisabled: !samePass });
  }

  handleSubmit(e) {
    const that = this;
    const token = this.getQueryStringValue('reset_password_token');

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = '';

      try {
        const json = JSON.parse(error.source);
        if (json.error) {
          message = json.error;
          const matches = message.match(/match/);

          if (matches) {
            message = that.props.intl.formatMessage(messages.unmatchingPasswords);
            that.setState({ password: '', password_confirmation: '' });
          }
        }
      } catch (e) { }

      that.setState({ errorMsg: message, submitDisabled: true });
    };

    const onSuccess = (response) => {
      that.setState({ showConfirmDialog: true });
    };

    if (!that.state.submitDisabled){
      Relay.Store.commitUpdate(
        new ChangePasswordMutation({
          reset_password_token: token,
          password: this.state.password,
          password_confirmation: this.state.password_confirmation,
        }),
        { onSuccess, onFailure },
      );
    }
    e.preventDefault();
  }

  render() {
    return (
      <div>
        { this.state.showConfirmDialog ?
          <Card className="user-password-change__confirm-card">
            <CardTitle title={<FormattedMessage id="passwordChange.successTitle" defaultMessage="Password updated" />} />
            <CardText>
              <FormattedMessage id="passwordChange.successMsg" defaultMessage="You're all set. Now you can log in with your new password." />
            </CardText>
            <CardActions className="user-password-change__actions">
              <FlatButton label={<FormattedMessage id="passwordChange.signIn" defaultMessage="Got it"/>} primary onClick={this.handleSignIn.bind(this)} />
            </CardActions>
          </Card> :
          <Card className="user-password-change__card">
            <CardText>
              <img src="/images/logo/check.svg" className="user-password-change__logo" />

              <span className="user-password-change__title"><FormattedMessage id="passwordChange.title" defaultMessage="Change password" /></span>
              <span className="user-password-change__error">{this.state.errorMsg}</span>

              <div className="user-password-change__password-input">
                <TextField className="user-password-change__password-input-field"
                  id="password-change-password-input"
                  type="password"
                  placeholder={this.props.intl.formatMessage(messages.newPassword)}
                  onChange={this.handleChangePassword.bind(this)}
                />
                <br />
                <TextField className="user-password-change__password-input-field"
                  id="password-change-password-input-confirm"
                  type="password"
                  placeholder={this.props.intl.formatMessage(messages.confirmPassword)}
                  onChange={this.handleChangePasswordConfirm.bind(this)}
                />
                <br />
                <RaisedButton className="user-password-change__submit-button" label="Change Password" onClick={this.handleSubmit.bind(this)} primary={true} disabled={this.state.submitDisabled} />
              </div>
            </CardText>
          </Card>
        }
      </div>
    );
  }
}

UserPasswordChange.contextTypes = {
  store: React.PropTypes.object,
};

export default injectIntl(UserPasswordChange);
