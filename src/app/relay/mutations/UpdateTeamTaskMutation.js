import Relay from 'react-relay/classic';

class UpdateTeamTaskMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateTeamTask {
      updateTeamTask
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on UpdateTeamTaskPayload {
        team {
          team_tasks
        }
      }
    `;
  }

  getVariables() {
    return this.props.teamTask;
  }

  getConfigs() {
    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: {
          team: this.props.team.id,
        },
      },
    ];
  }
}

export default UpdateTeamTaskMutation;
