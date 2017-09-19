import React, { Component } from 'react';
import Avatar from 'material-ui/Avatar';

class UserMenu extends Component {
  render() {
    const user = this.props.user;
    if (user) {
      return (
        <Avatar src={user.profile_image} size={32} className="avatar" />
      );
    }
    return null;
  }
}

export default UserMenu;
