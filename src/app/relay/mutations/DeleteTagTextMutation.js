import Relay from 'react-relay/classic';

class DeleteTagTextMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation destroyTagText {
      destroyTagText
    }`;
  }

  static fragments = {
    tag_text: () => Relay.QL`fragment on TagText { id }`,
  };

  getVariables() {
    return { id: this.props.id };
  }

  getFatQuery() {
    return Relay.QL`fragment on DestroyTagTextPayload { deletedId, team { id } }`;
  }

  getOptimisticResponse() {
    return { deletedId: this.props.id };
  }

  getConfigs() {
    return [
      {
        type: 'NODE_DELETE',
        parentName: 'team',
        parentID: this.props.teamId,
        connectionName: 'custom_tags',
        deletedIDFieldName: 'deletedId',
      },
      {
        type: 'NODE_DELETE',
        parentName: 'team',
        parentID: this.props.teamId,
        connectionName: 'teamwide_tags',
        deletedIDFieldName: 'deletedId',
      },
    ];
  }
}

export default DeleteTagTextMutation;
