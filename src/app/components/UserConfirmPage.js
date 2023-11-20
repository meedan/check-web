import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router';
import cx from 'classnames/bind';
import ButtonMain from './cds/buttons-checkboxes-chips/ButtonMain';
import PageTitle from './PageTitle';
import { FormattedGlobalMessage } from './MappedMessage';
import CheckAgreeTerms from './CheckAgreeTerms';
import ErrorBoundary from './error/ErrorBoundary';
import { stringHelper } from '../customHelpers';
import styles from './login/login.module.css';

function UserConfirmPage({ params }) {
  return (
    <ErrorBoundary component="UserConfirmPage">
      <PageTitle>
        <div className={cx('user-confirm-page__component', styles['login-wrapper'])}>
          <div id="login-container" className={styles['login-container']}>
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
              <h6 className="confirm__heading">
                { params.confirmType === 'confirmed' ?
                  (<FormattedMessage
                    id="UserConfirmPage.confirmed"
                    defaultMessage="Account Confirmed"
                    description="Message for confirmed accounts"
                  />) : null
                }
                { params.confirmType === 'already-confirmed' ?
                  (<FormattedMessage
                    id="UserConfirmPage.alreadyConfirmed"
                    defaultMessage="Account Already Confirmed"
                    description="Message for accounts already confirmed"
                  />) : null
                }
              </h6>
              <p className="confirm_content">
                { params.confirmType === 'confirmed' ?
                  (<FormattedMessage
                    id="userConfirmed.confrimMessage"
                    defaultMessage="Thanks for confirming your email address! Now you can sign in."
                    description="Message for confirmed user"
                  />) : null
                }
                { params.confirmType === 'already-confirmed' ?
                  (<FormattedMessage
                    id="userConfirmed.alreadyConfrimMessage"
                    defaultMessage="Oops! Your account is already confirmed. Please sign in to get started."
                    description="Message for user who already confirmed before"
                  />) : null
                }
                { params.confirmType === 'unconfirmed' ?
                  (<FormattedMessage
                    id="userConfirmed.unConfrimMessage"
                    defaultMessage="Sorry, an error occurred while confirming your account. Please try again and contact {supportEmail} if the condition persists."
                    values={{
                      supportEmail: stringHelper('SUPPORT_EMAIL'),
                    }}
                    description="Message for unconfirmed users"
                  />) : null
                }
              </p>
              <Link to="/">
                <ButtonMain
                  size="default"
                  theme="brand"
                  variant="contained"
                  label={
                    <FormattedMessage
                      id="userConfirmPage.signIn"
                      defaultMessage="Sign In"
                      description="Sign in button"
                    />
                  }
                />
              </Link>
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

export default UserConfirmPage;
