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
import styles from './login/login.module.css';

function UserPasswordChange() {
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);

  const handleSignIn = () => {
    browserHistory.push('/');
  };

  const getQueryStringValue = (key) => {
    const value = window.location.search.replace(new RegExp(`^(?:.*[&\\?]${encodeURIComponent(key).replace(/[.+*]/g, '\\$&')}(?:\\=([^&]*))?)?.*$`, 'i'), '$1');
    return decodeURIComponent(value);
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
                    className={styles['login-logo']}
                    alt={appNameHuman}
                    src={stringHelper('LOGO_URL')}
                    width="120"
                  />
                )}
              </FormattedGlobalMessage>
              <h6 className="reset-password__heading">
                { showConfirmDialog ?
                  <FormattedMessage id="passwordChange.successTitle" defaultMessage="Password updated" description="Title message when the user password was successfully updated" />
                  : <FormattedMessage id="passwordChange.title" defaultMessage="Change password" description="Title message for the user to change their password" />
                }
              </h6>

              { showConfirmDialog ?
                <React.Fragment>
                  <FormattedMessage
                    tagName="p"
                    id="passwordChange.successMsg"
                    defaultMessage="You're all set. Now you can log in with your new password."
                    description="Success message when the user's password was changed and they can now login using the new password"
                  />
                  <div className="user-password-change__actions">
                    <ButtonMain
                      size="default"
                      variant="contained"
                      theme="brand"
                      onClick={handleSignIn}
                      label={
                        <FormattedMessage id="passwordChange.signIn" defaultMessage="Got it" description="Button label for the user to continue to the sign in page" />
                      }
                    />
                  </div>
                </React.Fragment> :
                <div className="user-password-change__card">
                  <ChangePasswordComponent
                    type="reset-password"
                    showCurrentPassword={false}
                    token={token}
                    showConfirm={showConfirm}
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
