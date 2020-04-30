import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { browserHistory } from 'react-router';
import Relay from 'react-relay/classic';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import ChangePasswordMutation from '../relay/mutations/ChangePasswordMutation';
import globalStrings from '../globalStrings';
import { stringHelper } from '../customHelpers';
import { getErrorMessage } from '../helpers';

const messages = defineMessages({
  newPassword: {
    id: 'passwordChange.newPassword',
    defaultMessage: 'New password (minimum {min} characters)',
  },
  currentPassword: {
    id: 'passwordChange.currentPassword',
    defaultMessage: 'Current password',
  },
  confirmPassword: {
    id: 'passwordChange.confirmPassword',
    defaultMessage: 'Confirm password',
  },
  changePassword: {
    id: 'passwordChange.changePassword',
    defaultMessage: 'Change password',
  },
  unmatchingPasswords: {
    id: 'passwordChange.unmatchingPasswords',
    defaultMessage: 'Passwords didn\'t match',
  },
});

// TODO Read this from the backend.
const passwordLength = {
  min: 8,
  max: 128,
};

class ChangePasswordComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      submitDisabled: true,
      errorMsg: '',
    };
  }

  static getQueryStringValue(key) {
    return decodeURIComponent(window.location.search.replace(new RegExp(`^(?:.*[&\\?]${encodeURIComponent(key).replace(/[.+*]/g, '\\$&')}(?:\\=([^&]*))?)?.*$`, 'i'), '$1'));
  }

  handleChangeCurrentPassword(e) {
    this.setState({ current_password: e.target.value });
  }

  handleChangePassword(e) {
    this.setState({ new_password: e.target.value });
  }

  handleChangePasswordConfirm(e) {
    const { new_password: password } = this.state;
    const { value: password_confirmation } = e.target;
    const bothFilled =
      password.length >= passwordLength.min && password_confirmation.length >= passwordLength.min;
    const samePass = password === password_confirmation;
    const errorMsg = bothFilled && !samePass ?
      this.props.intl.formatMessage(messages.unmatchingPasswords) : null;
    this.setState({ password_confirmation, errorMsg });
    this.setState({ submitDisabled: !(bothFilled && samePass) });
  }

  handleSubmit(e) {
    const onFailure = (transaction) => {
      const fallbackMessage = this.props.intl.formatMessage(globalStrings.unknownError, { supportEmail: stringHelper('SUPPORT_EMAIL') });
      const message = getErrorMessage(transaction, fallbackMessage);
      if (this.props.type === 'reset-password') {
        browserHistory.push({ pathname: '/check/user/password-reset', state: { errorMsg: message } });
        return;
      }
      this.setState({ errorMsg: message });
    };

    const onSuccess = () => {
      if (this.props.type === 'update-password') {
        window.location.reload();
      } else {
        this.props.show_confirm();
      }
    };

    if (!this.state.submitDisabled) {
      let id = 0;
      if (this.props.type === 'update-password') {
        id = this.props.user.dbid;
      }
      Relay.Store.commitUpdate(
        new ChangePasswordMutation({
          reset_password_token: this.props.token,
          current_password: this.state.current_password,
          password: this.state.new_password,
          password_confirmation: this.state.password_confirmation,
          id,
        }),
        { onSuccess, onFailure },
      );
    }
    e.preventDefault();
  }

  render() {
    const { show_current_password } = this.props;

    return (
      <div className="user-password-change__password-input">
        <div style={{ color: 'red', textAlign: 'center' }}>
          {this.state.errorMsg}
        </div>
        {show_current_password === true ?
          <TextField
            className="user-password-change__password-input-field"
            id="password-change-password-input-current"
            type="password"
            placeholder={this.props.intl.formatMessage(messages.currentPassword)}
            onChange={this.handleChangeCurrentPassword.bind(this)}
          />
          : null
        }
        <br />
        <TextField
          className="user-password-change__password-input-field"
          id="password-change-password-input"
          type="password"
          placeholder={this.props.intl.formatMessage(
            messages.newPassword,
            { min: passwordLength.min },
          )}
          onChange={this.handleChangePassword.bind(this)}
        />
        <br />
        <TextField
          className="user-password-change__password-input-field"
          id="password-change-password-input-confirm"
          type="password"
          placeholder={this.props.intl.formatMessage(messages.confirmPassword)}
          onChange={this.handleChangePasswordConfirm.bind(this)}
        />
        <br />
        <Button
          variant="contained"
          className="user-password-change__submit-button"
          onClick={this.handleSubmit.bind(this)}
          color="primary"
          disabled={this.state.submitDisabled}
        >
          {this.props.intl.formatMessage(messages.changePassword)}
        </Button>
      </div>
    );
  }
}

export default injectIntl(ChangePasswordComponent);
