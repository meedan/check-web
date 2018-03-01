import Relay from 'react-relay';

class UpdateUserNameEmailMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation { updateUser }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on UpdateUserPayload {
        user {
          id,
          name,
          email,
          unconfirmed_email
        }
      }
    `;
  }

  getVariables() {
    return { id: this.props.id, name: this.props.name, email: this.props.email };
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

const updateUserNameEmail = (id, name, email, onSuccess, onFailure) => {
  Relay.Store.commitUpdate(
    new UpdateUserNameEmailMutation({
      id,
      name,
      email,
    }),
    { onSuccess, onFailure },
  );
};

export default UpdateUserNameEmailMutation;
export { updateUserNameEmail };
