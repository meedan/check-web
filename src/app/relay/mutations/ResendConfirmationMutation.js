import Relay from 'react-relay';

class ResendConfirmationMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation { resendConfirmation }`;
  }

  getFatQuery() {
    return Relay.QL`fragment on ResendConfirmationPayload { success, expiry }`;
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
    return { email: this.props.email };
  }
}

export default ResendConfirmationMutation;
