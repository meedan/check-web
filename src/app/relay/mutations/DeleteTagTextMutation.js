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
        connectionName: 'tag_texts',
        deletedIDFieldName: 'deletedId',
      },
    ];
  }
}

export default DeleteTagTextMutation;
