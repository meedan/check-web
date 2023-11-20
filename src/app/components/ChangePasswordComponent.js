import React from 'react';
import PropTypes from 'prop-types';
import { graphql, commitMutation } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import Relay from 'react-relay/classic';
import cx from 'classnames/bind';
import ButtonMain from './cds/buttons-checkboxes-chips/ButtonMain';
import TextField from './cds/inputs/TextField';
import Message from './Message';
import GenericUnknownErrorMessage from './GenericUnknownErrorMessage';
import { getErrorMessage } from '../helpers';
import inputStyles from '../styles/css/inputs.module.css';

function ChangePasswordComponent({
  type,
  showCurrentPassword,
  token,
  showConfirm,
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
        id="passwordChange.unmatchingPasswords"
        defaultMessage="Passwords didn't match"
        description="Error message when the supplied password and confirmation of password are not the same"
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
        onCompleted: ({ response, error }) => {
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
    <div className={cx('user-password-change__password-input', inputStyles['form-fieldset'])}>
      <Message message={errorMsg} />
      {showCurrentPassword === true ? (
        <TextField
          required
          className={cx('user-password-change__password-input-field', inputStyles['form-fieldset-field'])}
          componentProps={{
            id: 'password-change-password-input-current',
            type: 'password',
          }}
          onChange={(e) => { handleChangeCurrentPassword(e); }}
          label={
            <FormattedMessage
              id="passwordChange.currentPassword"
              defaultMessage="Current password"
              description="Text field label for the users current password"
            />
          }
        />
      ) : null}
      <TextField
        required
        className={cx('user-password-change__password-input-field', inputStyles['form-fieldset-field'])}
        componentProps={{
          id: 'password-change-password-input',
          type: 'password',
        }}
        onChange={handleChangePassword}
        label={
          <FormattedMessage
            id="passwordChange.newPassword"
            defaultMessage="New password (minimum {min} characters)"
            values={{ min: passwordLength.min }}
            description="Text field label for the users new password"
          />
        }
      />
      <TextField
        required
        className="user-password-change__password-input-field"
        componentProps={{
          id: 'password-change-password-input-confirm',
          type: 'password',
        }}
        onChange={handleChangePasswordConfirm}
        label={
          <FormattedMessage
            id="passwordChange.confirmPassword"
            defaultMessage="Confirm password"
            description="Text field label for the users to confirm their new password"
          />
        }
      />
      <br />
      <ButtonMain
        size="default"
        variant="contained"
        theme="brand"
        className="user-password-change__submit-button"
        onClick={handleSubmit}
        disabled={submitDisabled}
        label={
          <FormattedMessage id="passwordChange.changePassword" defaultMessage="Change password" description="Button label to initial password change" />
        }
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
  showCurrentPassword: PropTypes.string,
  token: PropTypes.string,
  showConfirm: PropTypes.func,
  user: PropTypes.object,
};

export default ChangePasswordComponent;
