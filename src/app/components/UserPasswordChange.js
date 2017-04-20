import React, { Component, PropTypes } from 'react';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import Relay from 'react-relay';
import { Link } from 'react-router';
import { Card, CardText, CardActions } from 'material-ui/Card';
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
  }
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

  handleChangePassword(e) {
    this.setState({ password: e.target.value });
  }

  handleChangePasswordConfirm(e) {
    this.setState({ password_confirmation: e.target.value }, this.canSubmit);
  }

  canSubmit() {
    this.setState({ submitDisabled: (!this.state.password || !this.state.password_confirmation)});
  }

  handleSubmit(e) {
    const that = this;

    const token = this.getQueryStringValue('reset_password_token');

    console.log('token');
    console.log(token);

    const onFailure = (transaction) => {
      that.setState({ errorMsg: that.props.intl.formatMessage(messages.emailNotFound), submitDisabled: true });
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
        <Card className="user-password-change__card">
          <CardText>
            <img src="/images/logo/check.svg" className="user-password-change__logo" />

            <span className="user-password-change__title"><FormattedMessage id="passwordChange.title" defaultMessage="Change password" /></span>
            <span className="user-password-change__error"><FormattedMessage id="passwordChange.unmatchingPasswords" defaultMessage="Passwords didn't match" /></span>

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
      </div>
    );
  }
}

UserPasswordChange.contextTypes = {
  store: React.PropTypes.object,
};

export default injectIntl(UserPasswordChange);
