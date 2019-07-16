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
    get_suggested_tags,
    get_max_number_of_members,
    pusher_channel,
    public_team_id,
    translation_statuses,
    verification_statuses,
    source_verification_statuses,
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
          medias_count,
          assignments_count,
        }
      }
    }
  }
`;

module.exports = teamFragment;
