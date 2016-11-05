import Relay from 'react-relay';

var sourceFragment = Relay.QL`
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
          created_at,
          permissions,
          medias(first: 10000) {
            edges {
              node {
                id,
                dbid,
                published,
                url,
                jsondata,
                project_id,
                last_status,
                annotations_count,
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
          jsondata,
          annotations_count,
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
