import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import LoginEmail from './LoginEmail';
import Message from './Message';

class LoginMenu extends Component {
  render() {
    const { loginTwitter, loginFacebook, loginSlack, state } = this.props;
    return (

      <div id="login-menu" class="login-menu">
        <div class="browser-support">
          <p class="browser-support__message">Best viewed with <i class='fa fa-chrome'></i> <a href="https://www.google.com/chrome/browser/desktop/">Chrome for Desktop</a>.</p>
        </div>
        <Message message={state.app.message} />

        <img class="login-menu__icon" src="/images/logo-1.svg">
        <div class="login-menu__content">
          
          <h2>Create an account or sign in</h2>

          <div class="nudge-electionland">
            <img class="electionland-logo" width="30" src="/images/Electionland_small.svg" alt=" " title=" " />
            <p>New Electionland members should sign up with Slack!</p>
            <img class="arrow" src="/images/arrow-left.png" alt=" " title=" " >
          </div>

          <ul class="login-menu__options">
            <li>
              <button onClick={loginSlack} id="slack-login" className='login-menu__button login-menu__button--slack'>Sign in with Slack</button>
            </li>
          </ul>

          <p>Reports discovered via social media are meant solely as <em>tips</em>. Always contact the source before sharing publicly.</p>

          <p class="other-method">If you’ve already connected with another method or aren’t on the Electionland team, you have a few more options.</p>

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

          <p class="nudge-support">Forgot your password? Can’t find your team? If you’re having any trouble, contact a human at <a href="mailto:check@meedan.com">check@meedan.com</a>.</p>

          <p class="login-menu__footer"><span>By signing in, you agree to the Check </span><a class="login-menu__footer-link" href="/tos">Terms of Service</a><span> and </span><a class="login-menu__footer-link" href="/privacy">Privacy&nbsp;Policy</a><span>.</span> </p>
        </div>
      </div>
    );
  }
}

export default LoginMenu;
