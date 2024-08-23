import React from 'react';
import { graphql, commitMutation } from 'react-relay/compat';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import cx from 'classnames/bind';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import TextField from '../cds/inputs/TextField';
import PageTitle from '../PageTitle';
import { FormattedGlobalMessage } from '../MappedMessage';
import CheckAgreeTerms from '../CheckAgreeTerms';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import ErrorBoundary from '../error/ErrorBoundary';
import { stringHelper } from '../../customHelpers';
import { getErrorMessageForRelayModernProblem } from '../../helpers';
import inputStyles from '../../styles/css/inputs.module.css';
import styles from './login.module.css';

const UserPasswordReset = (props) => {
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [submitDisabled, setSubmitDisabled] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState(null);
  const [email, setEmail] = React.useState(null);

  const handleGoBack = () => {
    browserHistory.goBack();
  };

  const handleSignIn = () => {
    browserHistory.push('/');
  };

  const handleChange = (e) => {
    const value = e.target.value.trim();
    const canSubmit = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value);
    const message = canSubmit ? '' : (
      <FormattedMessage
        defaultMessage="Please enter a valid email address."
        description="Error message for invalid email address"
        id="passwordReset.emailNotValid"
      />
    );
    setErrorMsg(message);
    setEmail(value);
    setSubmitDisabled(!canSubmit);
  };

  const handleSubmit = (e) => {
    const onFailure = (error) => {
      const message = getErrorMessageForRelayModernProblem(error)[0].message || <GenericUnknownErrorMessage />;
      setErrorMsg(message);
      setSubmitDisabled(true);
    };

    const onSuccess = () => {
      setShowConfirmDialog(true);
    };

    if (!submitDisabled) {
      commitMutation(Relay.Store, {
        mutation: graphql`
          mutation UserPasswordResetResetPasswordMutation($input: ResetPasswordInput!) {
            resetPassword(input: $input) {
              success
            }
          }
        `,
        variables: {
          input: {
            email,
          },
        },
        onCompleted: onSuccess,
        onError: onFailure,
      });
    }
    e.preventDefault();
  };

  const previousErrorMsg = props.location.state && props.location.state.errorMsg;

  const pagetitleMessage = (
    <FormattedMessage
      defaultMessage="Reset password"
      description="Reset password page title"
      id="passwordReset.title"
    />
  );

  return (
    <ErrorBoundary component="UserPasswordReset">
      <PageTitle>
        <div className={cx('user-password-reset__component', styles['login-wrapper'])}>
          <div className={styles['login-container']}>
            <div className={styles['login-form']}>
              <FormattedGlobalMessage messageKey="appNameHuman">
                {appNameHuman => (
                  <img
                    alt={appNameHuman}
                    className={styles['login-logo']}
                    src={stringHelper('LOGO_URL')}
                    width="120"
                  />
                )}
              </FormattedGlobalMessage>
              <h6 className="reset-password__heading">
                { pagetitleMessage }
              </h6>
              { showConfirmDialog ? [
                <div className="user-password-reset__sent_password" key="usr-2">
                  <FormattedHTMLMessage
                    defaultMessage='If this email address exists, you will receive an email from <a href="mailto:{adminEmail}">{adminEmail}</a> with instructions to reset your password.'
                    description="Confirmation text to tell the user what will happen if their password request request was valid"
                    id="passwordReset.confirmedText"
                    tagName="p"
                    values={{
                      adminEmail: stringHelper('ADMIN_EMAIL'),
                    }}
                  />
                  <FormattedMessage
                    defaultMessage="Make sure password reset emails do not end up in your spam mailbox."
                    description="Confirmation text to tell the user that password resets may end up in spam folders"
                    id="passwordReset.confirmedTextSpam"
                    tagName="p"
                  />
                  <FormattedHTMLMessage
                    defaultMessage='If you are not receiving our password reset emails, contact <a href="mailto:{supportEmail}">{supportEmail}</a>.'
                    description="Confirmation text to tell the user how to contact support if they do not receive a password reset email"
                    id="passwordReset.confirmedTextExtra"
                    tagName="p"
                    values={{
                      supportEmail: stringHelper('SUPPORT_EMAIL'),
                    }}
                  />
                </div>,
                <ButtonMain
                  disabled={submitDisabled}
                  label={
                    <FormattedMessage defaultMessage="Sign In" description="Sign in button label" id="passwordReset.signIn" />
                  }
                  size="default"
                  theme="info"
                  variant="contained"
                  onClick={handleSignIn}
                />,
              ] : [
                <div key="usr-2">
                  { previousErrorMsg ? <p>{previousErrorMsg}</p> : null }
                  <FormattedMessage
                    defaultMessage="Add your address and an email will be sent with further instructions."
                    description="Helper text about why the user should enter their email address"
                    id="passwordReset.text"
                    tagName="p"
                  />
                  <div className={cx('user-password-reset__email-input', inputStyles['form-fieldset'])}>
                    <TextField
                      autoFocus
                      className={inputStyles['form-fieldset-field']}
                      componentProps={{
                        id: 'password-reset-email-input',
                        type: 'email',
                      }}
                      error={errorMsg}
                      helpContent={errorMsg}
                      label={<FormattedMessage defaultMessage="Email" description="Textfield label for email address" id="passwordReset.email" />}
                      required
                      onChange={handleChange}
                    />
                  </div>
                </div>,
                <div className={cx(styles['login-agree-terms'])}>
                  <CheckAgreeTerms />
                </div>,
                <div className={cx('user-password-reset__actions', inputStyles['form-footer-actions'], styles['user-password-reset__actions'])}>
                  <ButtonMain
                    label={
                      <FormattedMessage
                        defaultMessage="Cancel"
                        description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation"
                        id="global.cancel"
                      />
                    }
                    size="default"
                    theme="lightText"
                    variant="text"
                    onClick={handleGoBack}
                  />
                  <ButtonMain
                    disabled={submitDisabled}
                    label={pagetitleMessage}
                    size="default"
                    theme="info"
                    variant="contained"
                    onClick={handleSubmit}
                  />
                </div>,
              ]}
            </div>
          </div>
        </div>
      </PageTitle>
    </ErrorBoundary>
  );
};

UserPasswordReset.contextTypes = {
  store: PropTypes.object,
};

export default UserPasswordReset;
