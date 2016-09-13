import Relay from 'react-relay';

var userFragment = Relay.QL`
  fragment on User {
    id,
    name,
    provider,
    profile_image,
    current_team {
      id,
      dbid,
      name,
      avatar,
      members_count
    },
    team_users(first: 20) {
      edges {
        node {
          team {
            id,
            dbid,
            name,
            avatar,
            members_count
          }
          id,
          status,
          role
        }
      }
    }
  }
`;

module.exports = userFragment;
