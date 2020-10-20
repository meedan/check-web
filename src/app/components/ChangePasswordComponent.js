import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import Relay from 'react-relay/classic';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import GenericUnknownErrorMessage from './GenericUnknownErrorMessage';
import ChangePasswordMutation from '../relay/mutations/ChangePasswordMutation';
import { getErrorMessage } from '../helpers';

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
    const errorMsg = bothFilled && !samePass ? (
      <FormattedMessage
        id="passwordChange.unmatchingPasswords"
        defaultMessage="Passwords didn't match"
      />
    ) : null;
    this.setState({ password_confirmation, errorMsg });
    this.setState({ submitDisabled: !(bothFilled && samePass) });
  }

  handleSubmit(e) {
    const onFailure = (transaction) => {
      const message = getErrorMessage(transaction, <GenericUnknownErrorMessage />);
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
        <Box color="red" textAlign="center">
          {this.state.errorMsg}
        </Box>
        {show_current_password === true ? (
          <FormattedMessage
            id="passwordChange.currentPassword"
            defaultMessage="Current password"
          >
            {label => (
              <TextField
                className="user-password-change__password-input-field"
                id="password-change-password-input-current"
                type="password"
                placeholder={label /* TODO why not label={label}? */}
                onChange={this.handleChangeCurrentPassword.bind(this)}
              />
            )}
          </FormattedMessage>
        ) : null}
        <br />
        <FormattedMessage
          id="passwordChange.newPassword"
          defaultMessage="New password (minimum {min} characters)"
          values={{ min: passwordLength.min }}
        >
          {label => (
            <TextField
              className="user-password-change__password-input-field"
              id="password-change-password-input"
              type="password"
              placeholder={label /* TODO why not label={label}? */}
              onChange={this.handleChangePassword.bind(this)}
            />
          )}
        </FormattedMessage>
        <br />
        <FormattedMessage id="passwordChange.confirmPassword" defaultMessage="Confirm password">
          {label => (
            <TextField
              className="user-password-change__password-input-field"
              id="password-change-password-input-confirm"
              type="password"
              placeholder={label /* TODO why not label={label}? */}
              onChange={this.handleChangePasswordConfirm.bind(this)}
            />
          )}
        </FormattedMessage>
        <br />
        <Button
          variant="contained"
          className="user-password-change__submit-button"
          onClick={this.handleSubmit.bind(this)}
          color="primary"
          disabled={this.state.submitDisabled}
        >
          <FormattedMessage id="passwordChange.changePassword" defaultMessage="Change password" />
        </Button>
      </div>
    );
  }
}

export default ChangePasswordComponent;
