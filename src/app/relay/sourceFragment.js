import Relay from 'react-relay';

const sourceFragment = Relay.QL`
  fragment on Source {
    id,
    dbid,
    name,
    image,
    user_id,
    description,
    permissions,
    verification_statuses,
    accounts(first: 10000) {
      edges {
        node {
          url,
          provider
        }
      }
    },
    tags(first: 10000) {
      edges {
        node {
          tag,
          id
        }
      }
    },
    annotations(first: 10000) {
      edges {
        node {
          id,
          content,
          annotation_type,
          updated_at,
          permissions,
          medias(first: 10000) {
            edges {
              node {
                id,
                dbid,
                published,
                url,
                embed,
                project_id,
                last_status,
                log_count,
                permissions,
                verification_statuses,
                domain,
                user {
                  name,
                  source {
                    dbid
                  }
                }
              }
            }
          },
          annotator {
            name,
            profile_image
          }
        }
      }
    },
    medias(first: 10000) {
      edges {
        node {
          id,
          dbid,
          url,
          published,
          embed,
          log_count,
          domain,
          last_status,
          permissions,
          verification_statuses
        }
      }
    }
  }
`;

module.exports = sourceFragment;
