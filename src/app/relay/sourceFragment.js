import Relay from 'react-relay';

var sourceFragment = Relay.QL`
  fragment on Source {
    id,
    dbid,
    name,
    image,
    description,
    accounts(first: 20) {
      edges {
        node {
          url,
          provider
        }
      }
    },
    tags(first: 20) {
      edges {
        node {
          tag,
          id
        }
      }
    },
    annotations(first: 20) {
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
    }
  }
`;

module.exports = sourceFragment;
