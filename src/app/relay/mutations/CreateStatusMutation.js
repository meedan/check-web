import Relay from 'react-relay';

class CreateStatusMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation createStatus {
      createStatus
    }`;
  }

  getFatQuery() {
    switch (this.props.parent_type) {
    case 'source':
      return Relay.QL`fragment on CreateStatusPayload { statusEdge, source { log, log_count, id } }`;
    case 'project_media':
      return Relay.QL`fragment on CreateStatusPayload { statusEdge, project_media { log, id, last_status, log_count, last_status_obj { id } } }`;
    default:
      return '';
    }
  }

  getVariables() {
    const status = this.props.annotation;
    return { status: status.status, annotated_id: `${status.annotated_id}`, annotated_type: status.annotated_type };
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

export default CreateStatusMutation;
