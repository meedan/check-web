import Relay from 'react-relay/classic';

class UpdateProjectMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateProject {
      updateProject
    }`;
  }

  getFatQuery() {
    if (this.props.title || this.props.description) {
      return Relay.QL`fragment on UpdateProjectPayload { project { id, title, description } }`;
    }
    return Relay.QL`fragment on UpdateProjectPayload { project { id, assignments_count, assigned_users } }`;
  }

  getOptimisticResponse() {
    return {
      project: {
        id: this.props.id,
        title: this.props.title,
        description: this.props.description,
      },
    };
  }

  getVariables() {
    return {
      id: this.props.id,
      title: this.props.title,
      description: this.props.description,
      assigned_to_ids: this.props.assigned_to_ids,
    };
  }

  getConfigs() {
    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: { project: this.props.id },
      },
    ];
  }
}

export default UpdateProjectMutation;
