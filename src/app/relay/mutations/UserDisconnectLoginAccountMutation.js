import Relay from 'react-relay/classic';
import sourceFragment from '../sourceFragment';

class UserDisconnectLoginAccountMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation { userDisconnectLoginAccount }`;
  }

  getFatQuery() {
    return Relay.QL`fragment on UserDisconnectLoginAccountPayload { success, user {id, providers, source {${sourceFragment}}}}`;
  }

  getConfigs() {
    return [{
      type: 'REQUIRED_CHILDREN',
      children: [Relay.QL`
        fragment on UserDisconnectLoginAccountPayload {
          success,
          user {id, providers, source {${sourceFragment}}}
        }
      `],
    }];
  }

  getVariables() {
    return {
      provider: this.props.provider.key,
    };
  }
}

export default UserDisconnectLoginAccountMutation;
