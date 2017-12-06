import React from 'react';
import { Link } from 'react-router';
import Tooltip from 'rc-tooltip';
import UserTooltipRelay from '../../relay/UserTooltipRelay';

const ProfileLink = (props) => {
  const { user, className } = props;
  if (!user) { return null; }

  const url = user.dbid ? `/check/user/${user.dbid}` : '';
  return url ?
    <Tooltip placement="top" overlay={<UserTooltipRelay user={user} />}>
      <Link to={url} className={className}>{user.name}</Link>
    </Tooltip> : <span className={className}>{user.name}</span>;
};

export default ProfileLink;
