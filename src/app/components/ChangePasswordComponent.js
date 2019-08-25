import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Relay from 'react-relay/classic';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import ChangePasswordMutation from '../relay/mutations/ChangePasswordMutation';
import CheckContext from '../CheckContext';
import globalStrings from '../globalStrings';
import { stringHelper } from '../customHelpers';
import { safelyParseJSON } from '../helpers';

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

  getHistory() {
    return new CheckContext(this).getContextStore().history;
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
    const errorPasswordMsg = bothFilled && !samePass ?
      this.props.intl.formatMessage(messages.unmatchingPasswords) : '';
    this.setState({ password_confirmation, errorPasswordMsg });
    this.setState({ submitDisabled: !(bothFilled && samePass) });
  }

  handleSubmit(e) {
    const onFailure = (transaction) => {
      this.setState({ errorMsg: this.props.intl.formatMessage(globalStrings.unknownError, { supportEmail: stringHelper('SUPPORT_EMAIL') }) });
      const error = transaction.getError();
      const json = safelyParseJSON(error.source);
      if (json && json.error) {
        if (this.props.type === 'reset-password') {
          this.getHistory().push({ pathname: '/check/user/password-reset', state: { errorMsg: json.error } });
          return;
        }
        this.setState({ errorMsg: json.error });
      }
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
            id="password-change-password-input"
            type="password"
            hintText={this.props.intl.formatMessage(messages.currentPassword)}
            onChange={this.handleChangeCurrentPassword.bind(this)}
          />
          : null
        }
        <br />
        <TextField
          className="user-password-change__password-input-field"
          id="password-change-password-input"
          type="password"
          hintText={this.props.intl.formatMessage(
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
          hintText={this.props.intl.formatMessage(messages.confirmPassword)}
          onChange={this.handleChangePasswordConfirm.bind(this)}
          errorText={this.state.errorPasswordMsg}
        />
        <br />
        <RaisedButton
          className="user-password-change__submit-button"
          label="Change Password"
          onClick={this.handleSubmit.bind(this)}
          primary
          disabled={this.state.submitDisabled}
        />
      </div>
    );
  }
}

ChangePasswordComponent.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(ChangePasswordComponent);
