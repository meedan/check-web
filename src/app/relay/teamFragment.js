import Relay from 'react-relay';

const teamFragment = Relay.QL`
  fragment on Team {
    id,
    dbid,
    name,
    avatar,
    description,
    slug,
    permissions,
    limits,
    get_slack_notifications_enabled,
    get_slack_webhook,
    get_slack_channel,
    get_suggested_tags,
    pusher_channel,
    translation_statuses,
    media_verification_statuses,
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
    sources(first: 10000) {
      edges {
        node {
          name
        }
      }
    },
    projects(first: 10000) {
      edges {
        node {
          title,
          dbid,
          id,
          description
        }
      }
    }
  }
`;

module.exports = teamFragment;
