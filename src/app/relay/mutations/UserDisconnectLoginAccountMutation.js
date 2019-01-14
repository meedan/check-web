import Relay from 'react-relay/classic';

class UserDisconnectLoginAccountMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation { userDisconnectLoginAccount }`;
  }

  getFatQuery() {
    return Relay.QL`fragment on UserDisconnectLoginAccountPayload { success, user {id, providers}}`;
  }

  getConfigs() {
    return [{
      type: 'REQUIRED_CHILDREN',
      children: [Relay.QL`
        fragment on UserDisconnectLoginAccountPayload {
          success,
          user {id, providers}
        }
      `],
    }];
  }

  getVariables() {
    return {
      id: this.props.user.dbid,
      provider: this.props.provider.key,
    };
  }
}

export default UserDisconnectLoginAccountMutation;
