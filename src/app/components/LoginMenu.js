import React, { Component, PropTypes } from 'react';

class LoginMenu extends Component {
  render() {
    const { loginTwitter, loginFacebook } = this.props;
    return (
      <div id="login-menu">
        <h2>Sign up / Sign in</h2>
        <ul>
          <li className="login-link login-twitter" onClick={loginTwitter}>Continue with Twitter</li>
          <li className="login-link login-facebook" onClick={loginFacebook}>Continue with Facebook</li>
        </ul>
      </div>
    );
  }
}

export default LoginMenu;
