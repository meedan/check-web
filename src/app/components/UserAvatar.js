import React, { Component } from 'react';
import Avatar from 'material-ui/Avatar';

class UserAvatar extends Component {
  render() {
    const me = this.props.me;
    if (me) {
      return (
        <Avatar src={me.profile_image} size={32} className="avatar" />
      );
    }
    return null;
  }
}

export default UserAvatar;
