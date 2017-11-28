import Relay from 'react-relay';

class DeleteTagMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation destroyTag {
      destroyTag
    }`;
  }

  static fragments = {
    tag: () => Relay.QL`fragment on Tag { id }`,
  };

  getVariables() {
    return { id: this.props.id };
  }

  getFatQuery() {
    switch (this.props.parent_type) {
    case 'source':
      return Relay.QL`fragment on DestroyTagPayload { deletedId, source { log, tags, log_count } }`;
    case 'project_media':
      return Relay.QL`fragment on DestroyTagPayload { deletedId, project_media { log, tags, log_count } }`;
    case 'project_source':
      return Relay.QL`fragment on DestroyTagPayload { deletedId, project_source { source { log, tags, log_count } } }`;
    default:
      return '';
    }
  }

  getConfigs() {
    const fieldIds = {};
    fieldIds[this.props.parent_type] = this.props.annotated.id;

    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: fieldIds,
      },
      {
        type: 'NODE_DELETE',
        parentName: this.props.parent_type,
        parentID: this.props.annotated.id,
        connectionName: 'tags',
        deletedIDFieldName: 'deletedId',
      },
    ];
  }
}

export default DeleteTagMutation;
