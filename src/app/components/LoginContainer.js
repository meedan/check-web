import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import Message from './Message';
import Login from './Login';

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
          <FormattedMessage
            id="agree.terms" defaultMessage={'By signing in, you agree to the Check {tosLink} and {ppLink}.'}
            values={{ tosLink: <Link to=" /check/tos" className="login-container__footer-link"><FormattedMessage id="tos.title" defaultMessage="Terms of Service" /></Link>, ppLink: <Link to="/check/privacy" className="login-container__footer-link"><FormattedMessage id="privacy.policy.title" defaultMessage="Privacy&nbsp;Policy" /></Link> }}
          />
        </p>

        <p>
          <FormattedHTMLMessage id="login.support" defaultMessage='For support contact <a href="mailto:check@meedan.com">check@meedan.com</a>.' />
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
