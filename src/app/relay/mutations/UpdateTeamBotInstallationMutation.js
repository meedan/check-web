import Relay from 'react-relay';

class UpdateTeamBotInstallationMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateTeamBotInstallation {
      updateTeamBotInstallation
    }`;
  }

  getVariables() {
    return { id: this.props.id, json_settings: this.props.json_settings };
  }

  getFatQuery() {
    return Relay.QL`fragment on UpdateTeamBotInstallationPayload {
      team_bot_installation {
        id
        json_settings
      }
    }`;
  }

  getConfigs() {
    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: { team_bot_installation: this.props.id },
      },
    ];
  }
}

export default UpdateTeamBotInstallationMutation;
