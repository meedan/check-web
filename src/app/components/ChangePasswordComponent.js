import React from 'react';
import { graphql, commitMutation } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import Relay from 'react-relay/classic';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Message from './Message';
import GenericUnknownErrorMessage from './GenericUnknownErrorMessage';
import { getErrorMessage } from '../helpers';
import { units } from '../styles/js/shared';

const useStyles = makeStyles({
  marginTop: {
    marginTop: `${units(3)}`,
  },
});

function ChangePasswordComponent({
  type,
  showCurrentPassword,
  token,
  showConfirm,
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
      password.length >= passwordLength.min && value.length >= passwordLength.min;
    const samePass = password === value;
    const message = bothFilled && !samePass ? (
      <FormattedMessage
        id="passwordChange.unmatchingPasswords"
        defaultMessage="Passwords didn't match"
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
        id = this.props.user.dbid;
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

  const classes = useStyles();

  return (
    <div className="user-password-change__password-input">
      <Message message={errorMsg} />
      {showCurrentPassword === true ? (
        <TextField
          className="user-password-change__password-input-field"
          id="password-change-password-input-current"
          type="password"
          onChange={(e) => { handleChangeCurrentPassword(e); }}
          fullWidth
          label={
            <FormattedMessage
              id="passwordChange.currentPassword"
              defaultMessage="Current password"
            />
          }
        />
      ) : null}
      <TextField
        className="user-password-change__password-input-field"
        id="password-change-password-input"
        type="password"
        onChange={(e) => { handleChangePassword(e); }}
        fullWidth
        label={
          <FormattedMessage
            id="passwordChange.newPassword"
            defaultMessage="New password (minimum {min} characters)"
            values={{ min: passwordLength.min }}
          />
        }
      />
      <TextField
        className="user-password-change__password-input-field"
        id="password-change-password-input-confirm"
        type="password"
        onChange={(e) => { handleChangePasswordConfirm(e); }}
        fullWidth
        label={
          <FormattedMessage
            id="passwordChange.confirmPassword"
            defaultMessage="Confirm password"
          />
        }
      />
      <Typography component="div" align="center">
        <Button
          variant="contained"
          className={['user-password-change__submit-button', classes.marginTop].join(' ')}
          onClick={(e) => { handleSubmit(e); }}
          color="primary"
          disabled={submitDisabled}
        >
          <FormattedMessage id="passwordChange.changePassword" defaultMessage="Change password" />
        </Button>
      </Typography>
    </div>
  );
}

export default ChangePasswordComponent;
