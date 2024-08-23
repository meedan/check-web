import React from 'react';
import { FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import cx from 'classnames/bind';
import PageTitle from './PageTitle';
import ButtonMain from './cds/buttons-checkboxes-chips/ButtonMain';
import ChangePasswordComponent from './ChangePasswordComponent';
import { FormattedGlobalMessage } from './MappedMessage';
import CheckAgreeTerms from './CheckAgreeTerms';
import ErrorBoundary from './error/ErrorBoundary';
import { stringHelper } from '../customHelpers';
import { getQueryStringValue } from '../urlHelpers';
import styles from './login/login.module.css';

function UserPasswordChange() {
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);

  const handleSignIn = () => {
    browserHistory.push('/');
  };

  const showConfirm = () => {
    setShowConfirmDialog(true);
  };

  const token = getQueryStringValue('reset_password_token');

  return (
    <ErrorBoundary component="UserPasswordChange">
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
                { showConfirmDialog ?
                  <FormattedMessage defaultMessage="Password updated" description="Title message when the user password was successfully updated" id="passwordChange.successTitle" />
                  : <FormattedMessage defaultMessage="Change password" description="Title message for the user to change their password" id="passwordChange.title" />
                }
              </h6>

              { showConfirmDialog ?
                <React.Fragment>
                  <FormattedMessage
                    defaultMessage="You're all set. Now you can log in with your new password."
                    description="Success message when the user's password was changed and they can now login using the new password"
                    id="passwordChange.successMsg"
                    tagName="p"
                  />
                  <div className="user-password-change__actions">
                    <ButtonMain
                      label={
                        <FormattedMessage defaultMessage="Got it" description="Button label for the user to continue to the sign in page" id="passwordChange.signIn" />
                      }
                      size="default"
                      theme="info"
                      variant="contained"
                      onClick={handleSignIn}
                    />
                  </div>
                </React.Fragment> :
                <div className="user-password-change__card">
                  <ChangePasswordComponent
                    showConfirm={showConfirm}
                    showCurrentPassword={false}
                    token={token}
                    type="reset-password"
                  />
                </div>
              }
              <div className={cx(styles['login-agree-terms'])}>
                <CheckAgreeTerms />
              </div>
            </div>
          </div>
        </div>
      </PageTitle>
    </ErrorBoundary>
  );
}

export default UserPasswordChange;
