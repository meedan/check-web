import Relay from 'react-relay';
import sourceFragment from './sourceFragment';

const userFragment = Relay.QL`
  fragment on User {
    id,
    name,
    email,
    permissions,
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
    },
    source {
      ${sourceFragment}
    }
  }
`;

module.exports = userFragment;
