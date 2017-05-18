import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { FormattedHTMLMessage, FormattedMessage, defineMessages } from 'react-intl';
import MappedMessage from './MappedMessage';
import Message from './Message';
import Login from './Login';
import config from 'config';
import { stringHelper } from '../customHelpers';
import { capitalize } from '../helpers';

const messages = defineMessages({
  agreeTerms: {
    id: 'agree.terms',
    defaultMessage: 'By signing in, you agree to the Check {tosLink} and {ppLink}.',
  },
  loginSupport: {
    id: 'login.support',
    defaultMessage: 'For support contact <a href="mailto:check@meedan.com">check@meedan.com</a>.',
  },
});

class LoginContainer extends Component {

  render() {
    return (

      <div id="login-container" className="login-container">
        <div className="browser-support">
          <p>
            <FormattedHTMLMessage id="browser.support.message" defaultMessage='Best viewed with <a href="https://www.google.com/chrome/browser/desktop/">Chrome for Desktop</a>.' />
          </p>
        </div>

        <Message message={this.props.message} />

        <Login loginCallback={this.props.loginCallback} />

        <p>
          { config.appName === 'check' ? [
              <FormattedMessage
                id="loginContainer.agreeTerms" defaultMessage={'By signing in, you agree to the {appName} {tosLink} and {ppLink}.'}
                values={{ appName: capitalize(config.appName), tosLink: <Link to=" /check/tos" className="login-container__footer-link"><FormattedMessage id="tos.title" defaultMessage="Terms of Service" /></Link>, ppLink: <Link to="/check/privacy" className="login-container__footer-link"><FormattedMessage id="privacy.policy.title" defaultMessage="Privacy&nbsp;Policy" /></Link> }}
              />
            ] : [
              <FormattedMessage
                id="loginContainer.agreeTerms" defaultMessage={'By signing in, you agree to the {appName} {tosLink} and {ppLink}.'}
                values={{ appName: capitalize(config.appName), tosLink: <a href={stringHelper('TOS_URL')} className="login-container__footer-link"><FormattedMessage id="tos.title" defaultMessage="Terms of Service" /></a>, ppLink: <a href={stringHelper('PP_URL')} className="login-container__footer-link"><FormattedMessage id="privacy.policy.title" defaultMessage="Privacy&nbsp;Policy" /></a> }}
              />
            ]
          }
        </p>

        <p>
          <FormattedHTMLMessage id="login.contactSupport" defaultMessage='For support contact <a href="mailto:{supportEmail}">{supportEmail}</a>.' values={{supportEmail: config.supportEmail}} />
        </p>
      </div>
    );
  }
}

Login.propTypes = {
  loginCallback: PropTypes.func,
  message: PropTypes.string,
};

export default LoginContainer;
