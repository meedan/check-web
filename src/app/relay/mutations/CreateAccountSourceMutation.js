import Relay from 'react-relay/classic';

class CreateAccountSourceMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation createAccountSource {
      createAccountSource
    }`;
  }

  getFatQuery() {
    return Relay.QL`fragment on CreateAccountSourcePayload { account_sourceEdge, source { account_sources, accounts } }`;
  }

  getVariables() {
    return { source_id: this.props.id, url: this.props.url };
  }

  getOptimisticResponse() {
    const source = this.props.source || {};
    const accountSources = source.account_sources ? source.account_sources.edges : [];
    const newAccountSources = accountSources.concat({ node: { account: { url: this.props.url, metadata: '' } } });
    return { account_sourceEdge: { newAccountSources } };
  }

  getConfigs() {
    const fieldIds = {};
    fieldIds.source = this.props.source.id;

    return [
      {
        type: 'RANGE_ADD',
        parentName: 'source',
        parentID: this.props.source.id,
        connectionName: 'account_sources',
        edgeName: 'account_sourceEdge',
        rangeBehaviors: () => 'prepend',
      },
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: fieldIds,
      },
    ];
  }
}

export default CreateAccountSourceMutation;
