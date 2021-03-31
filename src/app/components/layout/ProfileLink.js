import { Link } from 'react-router';
import React from 'react';
import Relay from 'react-relay/classic';

export const ProfileLink = ({ className, teamUser }) => {
  if (!teamUser) return null;

  const { user } = teamUser;

  let url = '';
  if (user.dbid && user.is_active) {
    url = `/check/user/${user.dbid}`;
  }

  return url ?
    <Link to={url} className={className}>
      {user.name}
    </Link> :
    <span className={className}>
      {user.name}
    </span>;
};

export default Relay.createContainer(ProfileLink, {
  fragments: {
    teamUser: () => Relay.QL`
      fragment on TeamUser {
        id
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
