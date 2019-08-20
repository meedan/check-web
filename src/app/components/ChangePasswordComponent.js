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
      submitErrors: '',
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
    const errorMsg = bothFilled && !samePass ?
      this.props.intl.formatMessage(messages.unmatchingPasswords) : '';
    this.setState({ password_confirmation, errorMsg, submitDisabled: !(bothFilled && samePass) });
  }

  handleSubmit(e) {
    const onFailure = (transaction) => {
      const error = transaction.getError();
      const json = safelyParseJSON(error.source);
      if (json && json.error) {
        this.setState({ submitErrors: json.error });
      } else {
        this.setState({ submitErrors: this.props.intl.formatMessage(globalStrings.unknownError, { supportEmail: stringHelper('SUPPORT_EMAIL') }), submitDisabled: true });
      }
    };

    const onSuccess = () => {
      window.location.reload();
    };

    if (!this.state.submitDisabled) {
      const { dbid } = this.props.user;
      Relay.Store.commitUpdate(
        new ChangePasswordMutation({
          current_password: this.state.current_password,
          password: this.state.new_password,
          password_confirmation: this.state.password_confirmation,
          id: dbid,
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
        <div style={{ color: 'red' }}>
          {this.state.submitErrors}
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
          errorText={this.state.errorMsg}
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
