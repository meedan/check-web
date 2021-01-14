import { Link } from 'react-router';
import React from 'react';
import Relay from 'react-relay/classic';
import Tooltip from 'rc-tooltip';
import UserTooltip from '../user/UserTooltip';

export const ProfileLink = ({ className, teamUser }) => {
  if (!teamUser) return null;

  let url = '';
  if (teamUser.user.dbid && teamUser.user.is_active) {
    url = `/check/user/${teamUser.user.dbid}`;
  }

  return url ?
    <Tooltip placement="top" overlay={<UserTooltip teamUser={teamUser} />}>
      <Link to={url} className={className}>
        {teamUser.user.name}
      </Link>
    </Tooltip> :
    <span className={className}>
      {teamUser.user.name}
    </span>;
};

export default Relay.createContainer(ProfileLink, {
  fragments: {
    teamUser: () => Relay.QL`
      fragment on TeamUser {
        id
        ${UserTooltip.getFragment('teamUser')}
        user {
          id
          dbid
          name
          is_active
        }
      }
    `,
  },
});
