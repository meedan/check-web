import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { FormattedHTMLMessage, FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import Favicon from 'react-favicon';
import MappedMessage, { mapGlobalMessage } from './MappedMessage';
import Message from './Message';
import Login from './Login';
import config from 'config';
import { stringHelper } from '../customHelpers';
import PageTitle from './PageTitle';

class LoginContainer extends Component {

  render() {
    return (
      <PageTitle skipTeam={true}>
        <div id="login-container" className="login-container">
          <Favicon url={`/images/logo/${config.appName}.ico`} animated={false} />
          <div className="browser-support">
            <p>
              <FormattedHTMLMessage id="browser.support.message" defaultMessage='Best viewed with <a href="https://www.google.com/chrome/browser/desktop/">Chrome for Desktop</a>.' />
            </p>
          </div>

          <Message message={this.props.message} />

          <Login loginCallback={this.props.loginCallback} />

          <p>
            <FormattedMessage
              id="loginContainer.agreeTerms" defaultMessage={'By signing in, you agree to the {appName} {tosLink} and {ppLink}.'}
              values={{
                appName: mapGlobalMessage(this.props.intl, 'appNameHuman'),
                tosLink: <a className="login-container__footer-link" target="_blank" rel="noopener noreferrer" href={stringHelper('TOS_URL')}><FormattedMessage id="tos.title" defaultMessage="Terms of Service" /></a>,
                ppLink: <a className="login-container__footer-link" target="_blank" rel="noopener noreferrer" href={stringHelper('PP_URL')}><FormattedMessage id="privacy.policy.title" defaultMessage="Privacy&nbsp;Policy" /></a>
              }}
            />
          </p>

          <p>
            <FormattedHTMLMessage id="login.contactSupport" defaultMessage='For support contact <a href="mailto:{supportEmail}">{supportEmail}</a>.' values={{supportEmail: stringHelper('SUPPORT_EMAIL')}} />
          </p>
        </div>
      </PageTitle>
    );
  }
}

Login.propTypes = {
  loginCallback: PropTypes.func,
  message: PropTypes.string,
};

export default injectIntl(LoginContainer);
