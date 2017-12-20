import React from 'react';
import SourcePicture from './source/SourcePicture';

const UserAvatar = (props) => {
  if (props.user) {
    return (
      <SourcePicture
        object={props.user.source}
        type="user"
        className="avatar"
      />
    );
  }
  return null;
};

export default UserAvatar;
