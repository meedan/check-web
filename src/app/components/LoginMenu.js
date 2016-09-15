import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import LoginEmail from './LoginEmail';
import Message from './Message';

class LoginMenu extends Component {
  render() {
    const { loginTwitter, loginFacebook, loginSlack, state } = this.props;
    return (
      <div id="login-menu" className='login-menu'>
        <Message message={state.app.message} />

        <img className='login-menu__icon' src='/images/logo/logo-1.svg'/>
        <h1 className='login-menu__heading'>Sign in</h1>
        <p className='login-menu__blurb'>Welcome to Check. Verify breaking news content with your team or online community. Then show your work to your audience on social media or your news site.</p>
        <p className='login-menu__disclaimer'>Currently in Beta and optimized for Chrome desktop.</p>
        <ul className="login-menu__options">
          <li className="item">
            <button onClick={loginTwitter} id="twitter-login" className='login-menu__button login-menu__button--twitter'>Sign in with Twitter</button>
          </li>
          {/*
          <li>
            <button disabled id="google-login" className='login-menu__button login-menu__button--google'>Sign in with Google</button>
          </li>
          */}
          <li>
            <button onClick={loginFacebook} id="facebook-login" className='login-menu__button login-menu__button--facebook'>Sign in with Facebook</button>
          </li>
          <li>
            <button onClick={loginSlack} id="slack-login" className='login-menu__button login-menu__button--slack'>Sign in with Slack</button>
          </li>
          <li>
            <LoginEmail {...this.props} />
          </li>
        </ul>
        <p className='login-menu__footer'>By signing in, you agree to the Check <Link to='/tos' className='login-menu__footer-link'>Terms of Service</Link> and <Link to='/privacy' className='login-menu__footer-link'>Privacy&nbsp;Policy</Link>.</p>
      </div>
    );
  }
}

export default LoginMenu;
