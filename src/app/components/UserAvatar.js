import React from 'react';
import SourcePicture from './source/SourcePicture';

const UserAvatar = (props) => {
  if (props.user) {
    return (
      <SourcePicture
        object={props.user.source}
        type="user"
        size={props.size}
        style={props.style}
        className="avatar"
      />
    );
  }
  return null;
};

export default UserAvatar;
