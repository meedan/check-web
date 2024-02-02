import Relay from 'react-relay/classic';

class SetUserSecuritySettingsMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation { updateUser }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on UpdateUserPayload {
        user {
          get_send_successful_login_notifications,
          get_send_failed_login_notifications
        }
      }
    `;
  }

  getVariables() {
    return {
      id: this.props.id,
      send_successful_login_notifications: this.props.sendSuccessfulLogin,
      send_failed_login_notifications: this.props.sendFailedLogin,
    };
  }

  getConfigs() {
    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: {
          user: this.props.id,
        },
      },
    ];
  }
}

export default SetUserSecuritySettingsMutation;
