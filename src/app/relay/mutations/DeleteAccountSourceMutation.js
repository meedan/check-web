import Relay from 'react-relay/classic';

class DeleteAccountSourceMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation destroyAccountSource {
      destroyAccountSource
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on DestroyAccountSourcePayload {
        deletedId, source { account_sources }
      }
    `;
  }

  getVariables() {
    return { id: this.props.id };
  }

  getConfigs() {
    const fieldIds = {};
    fieldIds.source = this.props.source.id;

    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: fieldIds,
      },
      {
        type: 'NODE_DELETE',
        parentName: 'source',
        parentID: this.props.source.id,
        connectionName: 'account_sources',
        deletedIDFieldName: 'deletedId',
      },
    ];
  }
}

export default DeleteAccountSourceMutation;
