import React from 'react';
import { Link } from 'react-router';
import UserTooltip from '../user/UserTooltip';
import Tooltip from 'rc-tooltip';

class ProfileLink extends React.Component {
  render() {
    const { user, team, className } = this.props;

    if (!user) { return null };

    let url = user.dbid ? `/check/user/${user.dbid}` : '';

    return url ?
      <Tooltip placement="top" overlay={<UserTooltip user={user} team={team} />}>
        <Link to={url} className={className}>{user.name}</Link>
      </Tooltip> : <span className={className}>{user.name}</span>;
  }
}

export default ProfileLink;
