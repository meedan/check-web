import Relay from 'react-relay/classic';

class DeleteVersionMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation destroyVersion {
      destroyVersion
    }`;
  }

  getVariables() {
    return { id: this.props.id };
  }

  getFatQuery() {
    switch (this.props.parent_type) {
    case 'source':
      return Relay.QL`fragment on DestroyVersionPayload { deletedId, source { id } }`;
    case 'project_media':
      return Relay.QL`fragment on DestroyVersionPayload { deletedId, project_media { log, log_count, last_status, last_status_obj { id } } }`;
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
    ];
  }
}

export default DeleteVersionMutation;
