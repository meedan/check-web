import Relay from 'react-relay/classic';

class DeleteAnnotationMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation destroyAnnotation {
      destroyAnnotation
    }`;
  }

  getVariables() {
    return { id: this.props.id };
  }

  getFatQuery() {
    switch (this.props.parent_type) {
    case 'source':
      return Relay.QL`fragment on DestroyAnnotationPayload { deletedId, source { id } }`;
    case 'project_media':
      return Relay.QL`fragment on DestroyAnnotationPayload { deletedId, project_media { log, tags, comments, tasks, last_status, last_status_obj { id } } }`;
    case 'task':
      return Relay.QL`fragment on DestroyAnnotationPayload { deletedId, task { id } }`;
    default:
      return '';
    }
  }

  getOptimisticResponse() {
    return { deletedId: this.props.id };
  }

  getConfigs() {
    const fieldIds = {};
    fieldIds[this.props.parent_type] = this.props.annotated.id;

    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: fieldIds,
      },
    ];
  }
}

export default DeleteAnnotationMutation;
