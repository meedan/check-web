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
import styles from './login.module.css';
import inputStyles from '../../styles/css/inputs.module.css';

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
        id="passwordReset.emailNotValid"
        defaultMessage="Please enter a valid email address."
        description="Error message for invalid email address"
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
      id="passwordReset.title"
      defaultMessage="Reset password"
      description="Reset password page title"
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
                    className={styles['login-logo']}
                    alt={appNameHuman}
                    width="120"
                    src={stringHelper('LOGO_URL')}
                  />
                )}
              </FormattedGlobalMessage>
              <h6 className="reset-password__heading">
                { pagetitleMessage }
              </h6>
              { showConfirmDialog ? [
                <div key="usr-2" className="user-password-reset__sent_password">
                  <FormattedHTMLMessage
                    tagName="p"
                    id="passwordReset.confirmedText"
                    defaultMessage='If this email address exists, you will receive an email from <a href="mailto:{adminEmail}">{adminEmail}</a> with instructions to reset your password.'
                    description="Confirmation text to tell the user what will happen if their password request request was valid"
                    values={{
                      adminEmail: stringHelper('ADMIN_EMAIL'),
                    }}
                  />
                  <FormattedMessage
                    tagName="p"
                    id="passwordReset.confirmedTextSpam"
                    defaultMessage="Make sure it did not end up in your spam mailbox."
                    description="Confirmation text to tell the user that password resets may end up in spam folders"
                  />
                  <FormattedHTMLMessage
                    tagName="p"
                    id="passwordReset.confirmedTextExtra"
                    defaultMessage='If you are not receiving our password reset emails, contact <a href="mailto:{supportEmail}">{supportEmail}</a>.'
                    description="Confirmation text to tell the user how to contact support if they do not receive a password reset email"
                    values={{
                      supportEmail: stringHelper('SUPPORT_EMAIL'),
                    }}
                  />
                </div>,
                <ButtonMain
                  size="default"
                  variant="contained"
                  theme="brand"
                  disabled={submitDisabled}
                  onClick={handleSignIn}
                  label={
                    <FormattedMessage id="passwordReset.signIn" defaultMessage="Sign In" description="Sign in button label" />
                  }
                />,
              ] : [
                <div key="usr-2">
                  { previousErrorMsg ? <p>{previousErrorMsg}</p> : null }
                  <FormattedMessage
                    tagName="p"
                    id="passwordReset.text"
                    defaultMessage="Add your address and an email will be sent with further instructions."
                    description="Helper text about why the user should enter their email address"
                  />
                  <div className={cx('user-password-reset__email-input', inputStyles['form-fieldset'])}>
                    <TextField
                      required
                      componentProps={{
                        id: 'password-reset-email-input',
                        type: 'email',
                      }}
                      className={inputStyles['form-fieldset-field']}
                      label={<FormattedMessage id="passwordReset.email" defaultMessage="Email" description="Textfield label for email address" />}
                      onChange={handleChange}
                      helpContent={errorMsg}
                      error={errorMsg}
                      autoFocus
                    />
                  </div>
                </div>,
                <div className={cx(styles['login-agree-terms'])}>
                  <CheckAgreeTerms />
                </div>,
                <div className={cx('user-password-reset__actions', inputStyles['form-footer-actions'], styles['user-password-reset__actions'])}>
                  <ButtonMain
                    onClick={handleGoBack}
                    size="default"
                    variant="text"
                    theme="lightText"
                    label={
                      <FormattedMessage
                        id="global.cancel"
                        defaultMessage="Cancel"
                        description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation"
                      />
                    }
                  />
                  <ButtonMain
                    size="default"
                    variant="contained"
                    theme="brand"
                    disabled={submitDisabled}
                    onClick={handleSubmit}
                    label={pagetitleMessage}
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
