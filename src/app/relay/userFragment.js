import Relay from 'react-relay/classic';
import sourceFragment from './sourceFragment';

const userFragment = Relay.QL`
  fragment on User {
    id,
    dbid,
    name,
    email,
    providers,
    two_factor,
    is_active,
    confirmed,
    unconfirmed_email,
    permissions,
    profile_image,
    get_send_email_notifications,
    get_send_successful_login_notifications,
    get_send_failed_login_notifications,
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
            private,
            members_count,
            permissions,
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

export default userFragment;
