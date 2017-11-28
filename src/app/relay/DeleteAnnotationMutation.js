import Relay from 'react-relay';

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
      return Relay.QL`fragment on DestroyAnnotationPayload { deletedId, source { log, tags, log_count } }`;
    case 'project_media':
      return Relay.QL`fragment on DestroyAnnotationPayload { deletedId, project_media { log, tags, tasks, embed, log_count, last_status, last_status_obj { id } } }`;
    case 'project_source':
      return Relay.QL`fragment on DestroyAnnotationPayload { deletedId, project_source { id, source { log, log_count, tags } } }`;
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
