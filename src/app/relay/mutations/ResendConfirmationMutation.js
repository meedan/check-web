import Relay from 'react-relay/classic';

class ResendConfirmationMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation { resendConfirmation }`;
  }

  getFatQuery() {
    return Relay.QL`fragment on ResendConfirmationPayload { success }`;
  }

  getConfigs() {
    return [{
      type: 'REQUIRED_CHILDREN',
      children: [Relay.QL`
        fragment on ResendConfirmationPayload {
          success
        }
      `],
    }];
  }

  getVariables() {
    return { id: this.props.user.dbid };
  }
}

export default ResendConfirmationMutation;
