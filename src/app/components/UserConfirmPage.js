import React from 'react';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
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
          <div className={styles['login-container']} id="login-container">
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
              <h6 className="confirm__heading">
                { params.confirmType === 'confirmed' ?
                  (<FormattedMessage
                    defaultMessage="Account Confirmed"
                    description="Message for confirmed accounts"
                    id="UserConfirmPage.confirmed"
                  />) : null
                }
                { params.confirmType === 'already-confirmed' ?
                  (<FormattedMessage
                    defaultMessage="Account Already Confirmed"
                    description="Message for accounts already confirmed"
                    id="UserConfirmPage.alreadyConfirmed"
                  />) : null
                }
              </h6>
              <p className="confirm_content">
                { params.confirmType === 'confirmed' ?
                  (<FormattedMessage
                    defaultMessage="Thanks for confirming your email address! Now you can sign in."
                    description="Message for confirmed user"
                    id="userConfirmed.confrimMessage"
                  />) : null
                }
                { params.confirmType === 'already-confirmed' ?
                  (<FormattedMessage
                    defaultMessage="Your account is already confirmed. Please sign in to get started."
                    description="Message for user who already confirmed before"
                    id="userConfirmed.alreadyConfrimMessage"
                  />) : null
                }
                { params.confirmType === 'unconfirmed' ?
                  (<FormattedHTMLMessage
                    defaultMessage='Sorry, an error occurred while confirming your account. Please try again and contact <a href="mailto:{supportEmail}">{supportEmail}</a> if the condition persists.'
                    description="Message for unconfirmed users"
                    id="userConfirmed.unConfrimMessage"
                    values={{
                      supportEmail: stringHelper('SUPPORT_EMAIL'),
                    }}
                  />) : null
                }
              </p>
              <Link to="/">
                <ButtonMain
                  label={
                    <FormattedMessage
                      defaultMessage="Sign In"
                      description="Sign in button"
                      id="userConfirmPage.signIn"
                    />
                  }
                  size="default"
                  theme="info"
                  variant="contained"
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
