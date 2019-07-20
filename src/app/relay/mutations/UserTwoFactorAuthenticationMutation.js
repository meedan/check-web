import Relay from 'react-relay/classic';

class UserTwoFactorAuthenticationMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation { userTwoFactorAuthentication }`;
  }

  getFatQuery() {
    return Relay.QL`fragment on UserTwoFactorAuthenticationPayload { success, user { two_factor } }`;
  }

  getConfigs() {
    return [{
      type: 'REQUIRED_CHILDREN',
      children: [Relay.QL`
        fragment on UserTwoFactorAuthenticationPayload {
          success
          user { two_factor }
        }
      `],
    }];
  }

  getVariables() {
    return {
      id: this.props.id,
      password: this.props.password,
      otp_required: this.props.otp_required,
      qrcode: this.props.qrcode,
    };
  }
}

export default UserTwoFactorAuthenticationMutation;
