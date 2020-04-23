import Relay from 'react-relay/classic';

class DeleteTeamBotInstallationMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation destroyTeamBotInstallation {
      destroyTeamBotInstallation
    }`;
  }

  getVariables() {
    return { id: this.props.id };
  }

  getFatQuery() {
    return Relay.QL`fragment on DestroyTeamBotInstallationPayload {
      deletedId
      team { id }
      bot_user
    }`;
  }

  getOptimisticResponse() {
    return { deletedId: this.props.id };
  }

  getConfigs() {
    const configs = [
      {
        type: 'NODE_DELETE',
        parentName: 'team',
        parentID: this.props.teamId,
        connectionName: 'team_bot_installations',
        deletedIDFieldName: 'deletedId',
      },
    ];
    if (this.props.botUserId) {
      configs.push({
        type: 'FIELDS_CHANGE',
        fieldIDs: {
          bot_user: this.props.botUserId,
        },
      });
    }
    return configs;
  }
}

export default DeleteTeamBotInstallationMutation;
