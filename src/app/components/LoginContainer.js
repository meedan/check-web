import React from 'react';
import { FormattedHTMLMessage, FormattedMessage, injectIntl } from 'react-intl';
import Favicon from 'react-favicon';
import Typography from '@material-ui/core/Typography';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import { mapGlobalMessage } from './MappedMessage';
import Message from './Message';
import FooterRelay from '../relay/containers/FooterRelay';
import Login from './Login';
import { stringHelper } from '../customHelpers';
import PageTitle from './PageTitle';
import { FadeIn, ContentColumn, units } from '../styles/js/shared';

const LoginContainer = props => (
  <Typography component="div" variant="body2" gutterBottom>
    <PageTitle>
      <ContentColumn style={{ maxWidth: units(82) }} id="login-container" className="login-container">
        <Favicon url={`/images/logo/${config.appName}.ico`} animated={false} />

        <p style={{ marginTop: 16, textAlign: 'center' }}>
          <FormattedHTMLMessage id="browser.support.message" defaultMessage='Best viewed with <a href="https://www.google.com/chrome/browser/desktop/">Chrome for Desktop</a>.' />
        </p>

        <Message message={props.message} />

        <FadeIn>
          <Login loginCallback={props.loginCallback} />
        </FadeIn>

        <p style={{ textAlign: 'center' }}>
          <FormattedMessage
            id="loginContainer.agreeTerms"
            defaultMessage="By signing up, you agree to the {appName} {tosLink} and {ppLink}."
            values={{
              appName: mapGlobalMessage(props.intl, 'appNameHuman'),
              tosLink: <a className="login-container__footer-link" target="_blank" rel="noopener noreferrer" href={stringHelper('TOS_URL')}><FormattedMessage id="tos.title" defaultMessage="Terms of Service" /></a>,
              ppLink: <a className="login-container__footer-link" target="_blank" rel="noopener noreferrer" href={stringHelper('PP_URL')}><FormattedMessage id="privacy.policy.title" defaultMessage="Privacy&nbsp;Policy" /></a>,
            }}
          />
        </p>

        <p style={{ textAlign: 'center' }}>
          <FormattedHTMLMessage
            id="login.contactSupport"
            defaultMessage='For support contact <a href="mailto:{supportEmail}">{supportEmail}</a>.'
            values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
          />
        </p>
        <FooterRelay {...props} />
      </ContentColumn>
    </PageTitle>
  </Typography>
);

export default injectIntl(LoginContainer);
