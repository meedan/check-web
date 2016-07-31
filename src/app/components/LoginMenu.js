import React, { Component, PropTypes } from 'react';
import {List, ListItem} from 'material-ui/lib/lists';
import Divider from 'material-ui/lib/divider';
import FontAwesome from 'react-fontawesome';
import LoginEmail from './LoginEmail';

class LoginMenu extends Component {
  render() {
    const { loginTwitter, loginFacebook } = this.props;
    return (
      <div id="login-menu">
        <h2>Sign up / Sign in</h2>
        <List className="list">
          <ListItem primaryText="Continue with Twitter" onClick={loginTwitter} id="twitter-login" leftIcon={<FontAwesome name="twitter" />} className="item" />
          <Divider />
          <ListItem primaryText="Continue with Facebook" onClick={loginFacebook} id="facebook-login" leftIcon={<FontAwesome name="facebook" />} className="item" />
          <Divider />
          <LoginEmail {...this.props} />
        </List>
      </div>
    );
  }
}

export default LoginMenu;
