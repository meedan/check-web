import Relay from 'react-relay/classic';

class DeleteCheckUserMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation { deleteCheckUser }`;
  }

  getFatQuery() {
    return Relay.QL`fragment on DeleteCheckUserPayload { success }`;
  }

  getConfigs() {
    return [{
      type: 'REQUIRED_CHILDREN',
      children: [Relay.QL`
        fragment on DeleteCheckUserPayload {
          success
        }
      `],
    }];
  }

  getVariables() {
    return {
      id: this.props.id,
    };
  }
}

export default DeleteCheckUserMutation;
