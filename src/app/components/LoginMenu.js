import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import LoginEmail from './LoginEmail';
import Message from './Message';
import { login } from '../actions/actions';

class LoginMenu extends Component {
  login(provider) {
    login(provider, this.props.loginCallback);
  }

  render() {
    return (

      <div id="login-menu" className="login-menu">
        <div className="browser-support">
          <p className="browser-support__message">
            <FormattedHTMLMessage id="browser.support.message" defaultMessage='Best viewed with <a href="https://www.google.com/chrome/browser/desktop/">Chrome for Desktop</a>.' />
          </p>
        </div>

        <Message message={this.props.message} />

        <img alt="Check" width="36" className="login-menu__icon" src="/images/logo/check.svg" />
        <div className="login-menu__content">

          <h2 className="login-menu__heading"><FormattedMessage id="login.title" defaultMessage="Sign in" /></h2>

          <ul className="login-menu__options">
            <li>
              <button onClick={this.login.bind(this, 'slack')} id="slack-login" className="login-menu__button login-menu__button--slack">
                <FormattedMessage id="login.with" defaultMessage={'Sign in with {provider}'} values={{ provider: 'Slack' }} />
              </button>
            </li>
            <li className="item">
              <button onClick={this.login.bind(this, 'twitter')} id="twitter-login" className="login-menu__button login-menu__button--twitter">
                <FormattedMessage id="login.with" defaultMessage={'Sign in with {provider}'} values={{ provider: 'Twitter' }} />
              </button>
            </li>
            <li>
              <button onClick={this.login.bind(this, 'facebook')} id="facebook-login" className="login-menu__button login-menu__button--facebook">
                <FormattedMessage id="login.with" defaultMessage={'Sign in with {provider}'} values={{ provider: 'Facebook' }} />
              </button>
            </li>
            <li>
              <LoginEmail loginCallback={this.props.loginCallback} />
            </li>
          </ul>

          <p className="nudge-support">
            <FormattedHTMLMessage id="login.support" defaultMessage='Can’t find your team? If you’re having any trouble, contact a human at <a href="mailto:check@meedan.com">check@meedan.com</a>.' />
          </p>

          <p className="login-menu__footer">
            <FormattedMessage
              id="agree.terms" defaultMessage={'By signing in, you agree to the Check {tosLink} and {ppLink}.'}
              values={{ tosLink: <Link to="/check/tos" className="login-menu__footer-link"><FormattedMessage id="tos.title" defaultMessage="Terms of Service" /></Link>, ppLink: <Link to="/check/privacy" className="login-menu__footer-link"><FormattedMessage id="privacy.policy.title" defaultMessage="Privacy&nbsp;Policy" /></Link> }}
            />
          </p>
        </div>
      </div>
    );
  }
}

LoginMenu.propTypes = {
  loginCallback: PropTypes.func,
  message: PropTypes.string,
};

export default LoginMenu;
