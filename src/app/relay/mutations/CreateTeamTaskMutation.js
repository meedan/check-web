import Relay from 'react-relay/classic';

class CreateTeamTaskMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation createTeamTask {
      createTeamTask
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on CreateTeamTaskPayload {
        team
      }
    `;
  }

  getVariables() {
    console.log('this.props');
    console.log(this.props);
    return { team_id: this.props.team.dbid, ...this.props.teamTask };
  }

  getConfigs() {
    return [
      {
        type: 'RANGE_ADD',
        parentName: 'team',
        parentID: this.props.team.id,
        connectionName: 'team_tasks',
        edgeName: 'team_taskEdge',
        rangeBehaviors: {
          '': 'append',
        },
      },
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: {
          team: this.props.team.id,
        },
      },
    ];
  }
}

export default CreateTeamTaskMutation;
