import Relay from 'react-relay';

class UpdateAccountMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateAccount {
      updateAccount
    }`;
  }

  getFatQuery() {
    return Relay.QL`fragment on UpdateAccountPayload {
      account {
        image,
        embed
      }
    }`;
  }

  getVariables() {
    return { refresh_account: 1, id: this.props.account.id };
  }

  getConfigs() {
    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: {
          account: this.props.account.id,
        },
      },
    ];
  }
}

export default UpdateAccountMutation;
