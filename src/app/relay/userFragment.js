import Relay from 'react-relay';

const userFragment = Relay.QL`
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
      slug,
      members_count
    },
    team_users(first: 10000) {
      edges {
        node {
          team {
            id,
            dbid,
            name,
            avatar,
            slug,
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
