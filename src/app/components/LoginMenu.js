import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import LoginEmail from './LoginEmail';
import Message from './Message';

class LoginMenu extends Component {
  render() {
    const { loginTwitter, loginFacebook, loginSlack, state } = this.props;
    return (

      <div id="login-menu" className="login-menu">
        <div className="browser-support">
          <p className="browser-support__message">Best viewed with <i className='fa fa-chrome'></i> <a href="https://www.google.com/chrome/browser/desktop/">Chrome for Desktop</a>.</p>
        </div>
        <Message message={state.app.message} />

        <img width="36" className="login-menu__icon" src="/images/logo/logo-1.svg" />
        <div className="login-menu__content">
          
          <h2 className="login-menu__heading">Sign in</h2>

          <ul className="login-menu__options">
            <li>
              <button onClick={loginSlack} id="slack-login" className='login-menu__button login-menu__button--slack'>Sign in with Slack</button>
            </li>
            <li className="item">
              <button onClick={loginTwitter} id="twitter-login" className='login-menu__button login-menu__button--twitter'>Sign in with Twitter</button>
            </li>
            <li>
              <button onClick={loginFacebook} id="facebook-login" className='login-menu__button login-menu__button--facebook'>Sign in with Facebook</button>
            </li>
            <li>
              <LoginEmail {...this.props}/>
            </li>
          </ul>

          <p className='nudge-support'>Forgot your password? Can’t find your team? If you’re having any trouble, contact a human at <a href='mailto:check@meedan.com'>check@meedan.com</a>.</p>

          <p className='login-menu__footer'>By signing in, you agree to the Check <Link to='/tos' className='login-menu__footer-link'>Terms of Service</Link> and <Link to='/privacy' className='login-menu__footer-link'>Privacy&nbsp;Policy</Link>.</p>
        </div>
      </div>
    );
  }
}

export default LoginMenu;
