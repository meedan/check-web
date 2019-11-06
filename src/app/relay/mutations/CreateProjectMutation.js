import Relay from 'react-relay/classic';

class CreateProjectMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation createProject {
      createProject
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on CreateProjectPayload {
        projectEdge,
        team { projects }
      }
    `;
  }

  getVariables() {
    return { title: this.props.title, team_id: this.props.team.dbid };
  }

  getConfigs() {
    return [
      {
        type: 'REQUIRED_CHILDREN',
        children: [Relay.QL`
          fragment on CreateProjectPayload {
            project {
              dbid
            }
          }`,
        ],
      },
      {
        type: 'RANGE_ADD',
        parentName: 'team',
        parentID: this.props.team.id,
        connectionName: 'projects',
        edgeName: 'projectEdge',
        rangeBehaviors: () => ('prepend'),
      },
    ];
  }
}

export default CreateProjectMutation;
