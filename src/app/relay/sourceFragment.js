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
          last_status
        }
      }
    }
  }
`;

module.exports = sourceFragment;
