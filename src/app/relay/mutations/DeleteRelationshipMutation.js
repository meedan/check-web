import Relay from 'react-relay/classic';

class DeleteRelationshipMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation destroyRelationship {
      destroyRelationship
    }`;
  }

  getVariables() {
    const vars = { id: this.props.id };
    if (this.props.current) {
      vars.current_id = this.props.current.dbid;
    }
    return vars;
  }

  getFatQuery() {
    return Relay.QL`fragment on DestroyRelationshipPayload {
      deletedId
      source_project_media { dbid, id, __typename, relationships }
      target_project_media { dbid, id, __typename, relationships }
      current_project_media { dbid, id, __typename, relationships }
    }`;
  }

  // getOptimisticResponse() {
  //   return { deletedId: this.props.id, source_project_media: this.props.source.id };
  // }

  getConfigs() {
    const ids = {
      source_project_media: this.props.source.id,
      target_project_media: this.props.target.id,
    };

    if (this.props.current) {
      ids.current_project_media = this.props.current.id;
    }

    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: ids,
      },
    ];
  }
}

export default DeleteRelationshipMutation;
