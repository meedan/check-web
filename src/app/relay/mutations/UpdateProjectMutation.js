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
          id,
          title,
          description
        }
      }
    `;
  }

  getVariables() {
    return {
      title: this.props.title,
      description: this.props.description,
      id: this.props.id,
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
