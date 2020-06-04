import Relay from 'react-relay/classic';

const sourceFragment = Relay.QL`
  fragment on Source {
    id,
    dbid,
    created_at,
    updated_at,
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
    account_sources(first: 10000) {
      edges {
        node {
          id,
          account {
            id,
            created_at,
            updated_at,
            metadata,
            url,
            uid,
            user_id,
            provider,
          }
        }
      }
    }
  }
`;

export default sourceFragment;
