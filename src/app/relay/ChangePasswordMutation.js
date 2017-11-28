import Relay from 'react-relay';

class ChangePasswordMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation { changePassword }`;
  }

  getFatQuery() {
    return Relay.QL`fragment on ChangePasswordPayload { success }`;
  }

  getConfigs() {
    return [];
  }

  getVariables() {
    return {
      reset_password_token: this.props.reset_password_token,
      password: this.props.password,
      password_confirmation: this.props.password_confirmation,
    };
  }
}

export default ChangePasswordMutation;
