import Relay from 'react-relay/classic';

class UpdateTeamBotInstallationMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateTeamBotInstallation {
      updateTeamBotInstallation
    }`;
  }

  getVariables() {
    const vars = {
      id: this.props.id,
      json_settings: this.props.json_settings,
      lock_version: this.props.lock_version,
    };
    return vars;
  }

  getFatQuery() {
    return Relay.QL`fragment on UpdateTeamBotInstallationPayload {
      team_bot_installation {
        id
        json_settings
        lock_version
      }
    }`;
  }

  getFiles() {
    if (this.props.file) {
      return { 'file[]': this.props.file };
    }
    if (this.props.files) {
      const files = {};
      Object.keys(this.props.files).forEach((key) => {
        files[`file[${key}]`] = this.props.files[key];
      });
      return files;
    }
    return {};
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
