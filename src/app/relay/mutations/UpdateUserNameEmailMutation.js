import Relay from 'react-relay/classic';

class UpdateUserNameEmailMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation { updateUser }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on UpdateUserPayload {
        me {
          id,
          name,
          get_send_email_notifications,
          email,
          unconfirmed_email
        }
      }
    `;
  }

  getVariables() {
    return {
      id: this.props.id,
      name: this.props.name,
      email: this.props.email,
      send_email_notifications: this.props.send_email_notifications,
    };
  }

  getConfigs() {
    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: {
          me: this.props.id,
        },
      },
    ];
  }
}

const updateUserNameEmail = (id, name, email, sendNotification, onSuccess, onFailure) => {
  Relay.Store.commitUpdate(
    new UpdateUserNameEmailMutation({
      id,
      name,
      email,
      send_email_notifications: sendNotification,
    }),
    { onSuccess, onFailure },
  );
};

export { updateUserNameEmail }; // eslint-disable-line import/prefer-default-export
