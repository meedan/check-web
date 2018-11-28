import Relay from 'react-relay/classic';

class UpdateProjectMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateProject {
      updateProject
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on UpdateProjectPayload {
        project {
          id
          title
          description
          assignments_count
          assigned_users
        }
      }
    `;
  }

  getVariables() {
    const vars = { id: this.props.id };
    if (this.props.title && this.props.description) {
      vars.title = this.props.title;
      vars.description = this.props.description;
    }
    if (this.props.assigned_to_ids !== undefined) {
      vars.assigned_to_ids = this.props.assigned_to_ids;
    }
    return vars;
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
