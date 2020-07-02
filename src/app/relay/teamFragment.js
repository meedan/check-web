import Relay from 'react-relay/classic';

const teamFragment = Relay.QL`
  fragment on Team {
    id,
    dbid,
    name,
    avatar,
    description,
    slug,
    private,
    projects_count,
    permissions,
    get_slack_notifications_enabled,
    get_slack_webhook,
    get_slack_channel,
    pusher_channel,
    public_team_id,
    verification_statuses,
    contacts(first: 1) {
      edges {
        node {
          location,
          web,
          phone,
          id
        }
      }
    },
    projects(first: $pageSize) {
      edges {
        node {
          title,
          dbid,
          id,
          description,
          assignments_count,
        }
      }
    }
  }
`;

export default teamFragment;
