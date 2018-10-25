import Relay from 'react-relay/classic';

class ResendCancelInvitationMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation { resendCancelInvitation }`;
  }

  getFatQuery() {
    return Relay.QL`fragment on ResendCancelInvitationPayload { success }`;
  }

  getConfigs() {
    return [{
      type: 'REQUIRED_CHILDREN',
      children: [Relay.QL`
        fragment on ResendCancelInvitationPayload {
          success
        }
      `],
    }];
  }

  getVariables() {
    return {
      email: this.props.email,
      action: this.props.action,
    };
  }
}

export default ResendCancelInvitationMutation;
