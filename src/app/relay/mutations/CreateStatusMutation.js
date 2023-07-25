import Relay from 'react-relay/classic';

class CreateStatusMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation createDynamic {
      createDynamic
    }`;
  }

  getFatQuery() {
    switch (this.props.parent_type) {
    case 'source':
      return Relay.QL`fragment on CreateDynamicPayload { dynamicEdge, source { id } }`;
    case 'project_media':
      return Relay.QL`fragment on CreateDynamicPayload { dynamicEdge, project_media { log, id, last_status, last_status_obj { id } } }`;
    default:
      return '';
    }
  }

  getVariables() {
    const status = this.props.annotation;
    return {
      set_fields: JSON.stringify({ verification_status_status: status.status }),
      annotation_type: 'verification_status',
      annotated_id: `${status.annotated_id}`,
      annotated_type: status.annotated_type,
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

export default CreateStatusMutation;
