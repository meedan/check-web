import Relay from 'react-relay/classic';

class DeleteDynamicMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation destroyDynamic {
      destroyDynamic
    }`;
  }

  static fragments = {
    annotation: () => Relay.QL`fragment on Annotation { id }`,
  };

  getVariables() {
    return { id: this.props.id };
  }

  getFatQuery() {
    switch (this.props.parent_type) {
    case 'project_source':
      return Relay.QL`fragment on DestroyDynamicPayload { deletedId, project_source { source { log, log_count } } }`;
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
        connectionName: 'annotations',
        deletedIDFieldName: 'deletedId',
      },
    ];
  }
}

export default DeleteDynamicMutation;
