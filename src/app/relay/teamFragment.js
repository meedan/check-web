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
    get_suggested_tags,
    pusher_channel,
    public_team_id,
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
    projects(first: $pageSize) {
      edges {
        node {
          title,
          dbid,
          id,
          description,
          medias_count,
        }
      }
    }
  }
`;

module.exports = teamFragment;
