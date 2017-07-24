import React, { Component } from 'react';
import Avatar from 'material-ui/Avatar';
import FlatButton from 'material-ui/FlatButton';
import MenuItem from 'material-ui/MenuItem';

class UserMenu extends Component {
  render() {
    const me = this.props.me;
    if (me) {
      return (
        <span
          className="current-user provider-{{me.provider}}"
        >
          <Avatar src={me.profile_image} size={32} className="avatar" />
        </span>
      );
    }
    return null;
  }
}

export default UserMenu;
