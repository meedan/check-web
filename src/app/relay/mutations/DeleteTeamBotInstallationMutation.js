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
      team_bot: bot_user {
        id
        installed
      }
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
    if (this.props.botId) {
      configs.push({
        type: 'FIELDS_CHANGE',
        fieldIDs: {
          team_bot: this.props.botId,
        },
      });
    }
    return configs;
  }
}

export default DeleteTeamBotInstallationMutation;
