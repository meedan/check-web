import React, { Component, PropTypes } from 'react';
import { FormattedHTMLMessage, FormattedMessage, injectIntl } from 'react-intl';
import Favicon from 'react-favicon';
import config from 'config';
import { mapGlobalMessage } from './MappedMessage';
import Message from './Message';
import FooterRelay from '../relay/FooterRelay';
import Login from './Login';
import { stringHelper } from '../customHelpers';
import PageTitle from './PageTitle';
import { FadeIn, ContentColumn, units } from '../styles/js/shared';

class LoginContainer extends Component {

  render() {
    return (
      <PageTitle skipTeam>
        <ContentColumn style={{ maxWidth: units(82) }} id="login-container" className="login-container">
          <Favicon url={`/images/logo/${config.appName}.ico`} animated={false} />
          <p style={{ marginTop: 16, textAlign: 'center' }}>
            <FormattedHTMLMessage id="browser.support.message" defaultMessage='Best viewed with <a href="https://www.google.com/chrome/browser/desktop/">Chrome for Desktop</a>.' />
          </p>

          <Message message={this.props.message} />

          <FadeIn>
            <Login loginCallback={this.props.loginCallback} />
          </FadeIn>

          <p style={{ textAlign: 'center' }}>
            <FormattedMessage
              id="loginContainer.agreeTerms" defaultMessage={'By signing in, you agree to the {appName} {tosLink} and {ppLink}.'}
              values={{
                appName: mapGlobalMessage(this.props.intl, 'appNameHuman'),
                tosLink: <a className="login-container__footer-link" target="_blank" rel="noopener noreferrer" href={stringHelper('TOS_URL')}><FormattedMessage id="tos.title" defaultMessage="Terms of Service" /></a>,
                ppLink: <a className="login-container__footer-link" target="_blank" rel="noopener noreferrer" href={stringHelper('PP_URL')}><FormattedMessage id="privacy.policy.title" defaultMessage="Privacy&nbsp;Policy" /></a>,
              }}
            />
          </p>

          <p style={{ textAlign: 'center' }}>
            <FormattedHTMLMessage id="login.contactSupport" defaultMessage='For support contact <a href="mailto:{supportEmail}">{supportEmail}</a>.' values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }} />
          </p>
          <FooterRelay {...this.props} />
        </ContentColumn>
      </PageTitle>
    );
  }
}

Login.propTypes = {
  loginCallback: PropTypes.func,
  message: PropTypes.string,
};

export default injectIntl(LoginContainer);
