import Relay from 'react-relay/classic';

class UserDisconnectLoginAccountMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation { userDisconnectLoginAccount }`;
  }

  getFatQuery() {
    return Relay.QL`fragment on UserDisconnectLoginAccountPayload {
      success,
      user {
        id,
        providers,
        source {
          image,
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
                  provider,
                }
              }
            }
          },
        }
      }
    }`;
  }

  getConfigs() {
    return [{
      type: 'REQUIRED_CHILDREN',
      children: [Relay.QL`
        fragment on UserDisconnectLoginAccountPayload {
          success,
          user {
            id,
            providers,
            source {
              image,
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
                      provider,
                    }
                  }
                }
              },
            }
          }
        }
      `],
    }];
  }

  getVariables() {
    return {
      provider: this.props.provider.key,
      uid: this.props.uid,
    };
  }
}

export default UserDisconnectLoginAccountMutation;
