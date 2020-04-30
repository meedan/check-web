import Relay from 'react-relay/classic';

class DeleteTeamTaskMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation destroyTeamTask {
      destroyTeamTask
    }`;
  }

  static fragments = {
    team: () => Relay.QL`fragment on Team { id, team_tasks }`,
  };

  getVariables() {
    return { id: this.props.id, keep_completed_tasks: this.props.keepCompleted };
  }

  getFatQuery() {
    return Relay.QL`fragment on DestroyTeamTaskPayload { deletedId, team { id } }`;
  }

  getOptimisticResponse() {
    return { deletedId: this.props.id };
  }

  getConfigs() {
    return [
      {
        type: 'NODE_DELETE',
        parentName: 'team',
        parentID: this.props.teamId,
        connectionName: 'team_tasks',
        deletedIDFieldName: 'deletedId',
      },
    ];
  }
}

export default DeleteTeamTaskMutation;
