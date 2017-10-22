import React, { Component } from 'react';
import SourcePicture from './source/SourcePicture';

class UserAvatar extends Component {
  render() {
    const { user } = this.props;

    if (user) {
      return (
        <SourcePicture
          object={user.source}
          type="user"
          size="small"
          className="avatar"
        />
      );
    }
    return null;
  }
}

export default UserAvatar;
