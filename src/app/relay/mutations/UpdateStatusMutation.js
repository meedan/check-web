import Relay from 'react-relay';

class UpdateStatusMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateStatus {
      updateStatus
    }`;
  }

  getFatQuery() {
    switch (this.props.parent_type) {
    case 'source':
      return Relay.QL`fragment on UpdateStatusPayload { statusEdge, source { log, log_count, id } }`;
    case 'project_media':
      return Relay.QL`fragment on UpdateStatusPayload { statusEdge, project_media { log, id, last_status, log_count } }`;
    default:
      return '';
    }
  }

  getVariables() {
    const status = this.props.annotation;
    return {
      id: status.status_id,
      status: status.status,
    };
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
export default UpdateStatusMutation;
