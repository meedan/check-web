/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { graphql, commitMutation } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import Relay from 'react-relay/classic';
import cx from 'classnames/bind';
import Alert from './cds/alerts-and-prompts/Alert';
import ButtonMain from './cds/buttons-checkboxes-chips/ButtonMain';
import TextField from './cds/inputs/TextField';
import GenericUnknownErrorMessage from './GenericUnknownErrorMessage';
import { getErrorMessage } from '../helpers';
import inputStyles from '../styles/css/inputs.module.css';

function ChangePasswordComponent({
  showConfirm,
  showCurrentPassword,
  token,
  type,
  user,
}) {
  const [submitDisabled, setSubmitDisabled] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState(null);
  const [currentPassword, setCurrentPassword] = React.useState(null);
  const [password, setPassword] = React.useState(null);
  const [passwordConfirmation, setPasswordConfirmation] = React.useState(null);

  const passwordLength = { min: 8, max: 128 };

  const handleChangeCurrentPassword = (e) => {
    setCurrentPassword(e.target.value);
  };

  const handleChangePassword = (e) => {
    setPassword(e.target.value);
  };

  const handleChangePasswordConfirm = (e) => {
    const { value } = e.target;
    const bothFilled =
      password?.length >= passwordLength.min && value.length >= passwordLength.min;
    const samePass = password === value;
    const message = bothFilled && !samePass ? (
      <FormattedMessage
        defaultMessage="Passwords didn't match"
        description="Error message when the supplied password and confirmation of password are not the same"
        id="passwordChange.unmatchingPasswords"
      />
    ) : null;
    setPasswordConfirmation(value);
    setErrorMsg(message);
    setSubmitDisabled(!(bothFilled && samePass));
  };

  const handleSubmit = (e) => {
    const onFailure = (transaction) => {
      const message = getErrorMessage(transaction, <GenericUnknownErrorMessage />);
      if (type === 'reset-password') {
        browserHistory.push({ pathname: '/check/user/password-reset', state: { errorMsg: message } });
        return;
      }
      setErrorMsg(message);
    };

    const onSuccess = () => {
      if (type === 'update-password') {
        window.location.reload();
      } else {
        showConfirm();
      }
    };

    if (!submitDisabled) {
      let id = 0;
      if (type === 'update-password') {
        id = user.dbid;
      }
      commitMutation(Relay.Store, {
        mutation: graphql`
          mutation ChangePasswordComponentChangePasswordMutation($input: ChangePasswordInput!) {
            changePassword(input: $input) {
              success
            }
          }
        `,
        variables: {
          input: {
            reset_password_token: token,
            password,
            password_confirmation: passwordConfirmation,
            current_password: currentPassword,
            id,
          },
        },
        onCompleted: ({ error, response }) => {
          if (error) {
            return onFailure(error);
          }
          return onSuccess(response);
        },
        onError: onFailure,
      });
    }
    e.preventDefault();
  };

  return (
    <div className={cx('int-user-password-change__password-input', inputStyles['form-fieldset'])}>
      { errorMsg && <><Alert contained title={errorMsg} variant="error" /><br /></> }
      {showCurrentPassword === true ? (
        <TextField
          className={cx('int-user-password-change__password-input-field', inputStyles['form-fieldset-field'])}
          componentProps={{
            id: 'password-change-password-input-current',
            type: 'password',
          }}
          label={
            <FormattedMessage
              defaultMessage="Current password"
              description="Text field label for the users current password"
              id="passwordChange.currentPassword"
            />
          }
          required
          onChange={(e) => { handleChangeCurrentPassword(e); }}
        />
      ) : null}
      <TextField
        className={cx('int-user-password-change__password-input-field', inputStyles['form-fieldset-field'])}
        componentProps={{
          id: 'password-change-password-input',
          type: 'password',
        }}
        label={
          <FormattedMessage
            defaultMessage="New password (minimum {min} characters)"
            description="Text field label for the users new password"
            id="passwordChange.newPassword"
            values={{ min: passwordLength.min }}
          />
        }
        required
        onChange={handleChangePassword}
      />
      <TextField
        className="int-user-password-change__password-input-field"
        componentProps={{
          id: 'password-change-password-input-confirm',
          type: 'password',
        }}
        label={
          <FormattedMessage
            defaultMessage="Confirm password"
            description="Text field label for the users to confirm their new password"
            id="passwordChange.confirmPassword"
          />
        }
        required
        onChange={handleChangePasswordConfirm}
      />
      <br />
      <ButtonMain
        className="user-password-change__submit-button"
        disabled={submitDisabled}
        label={
          <FormattedMessage defaultMessage="Change password" description="Button label to initial password change" id="passwordChange.changePassword" />
        }
        size="default"
        theme="info"
        variant="contained"
        onClick={handleSubmit}
      />
    </div>
  );
}

ChangePasswordComponent.defaultProps = {
  showCurrentPassword: false,
  token: null,
  showConfirm: null,
  user: null,
};

ChangePasswordComponent.propTypes = {
  type: PropTypes.string.isRequired,
  showCurrentPassword: PropTypes.bool,
  token: PropTypes.string,
  showConfirm: PropTypes.func,
  user: PropTypes.object,
};

export default ChangePasswordComponent;
