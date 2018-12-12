import React from 'react';
import { Link } from 'react-router';
import Tooltip from 'rc-tooltip';
import UserTooltip from '../user/UserTooltip';

const ProfileLink = (props) => {
  if (!props.user) return null;

  let url = '';
  if (props.user.dbid && props.user.is_active) {
    url = `/check/user/${props.user.dbid}`;
  }

  return url ?
    <Tooltip placement="top" overlay={<UserTooltip user={props.user} team={props.team} />}>
      <Link to={url} className={props.className}>
        {props.user.name}
      </Link>
    </Tooltip> :
    <span className={props.className}>
      {props.user.name}
    </span>;
};

export default ProfileLink;
