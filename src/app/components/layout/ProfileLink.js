import { Link } from 'react-router';
import React from 'react';

const ProfileLink = ({ className, user }) => {
  if (!user) return null;
  let url = '';
  if (user.dbid && user.is_active) {
    url = `/check/user/${user.dbid}`;
  }

  return url ?
    <Link className={className} to={url}>
      {user.name}
    </Link> :
    <span className={className}>
      {user.name}
    </span>;
};

export default ProfileLink;
