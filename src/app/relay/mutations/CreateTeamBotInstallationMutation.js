import Relay from 'react-relay/classic';

class CreateTeamBotInstallationMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation createTeamBotInstallation {
      createTeamBotInstallation
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on CreateTeamBotInstallationPayload {
        team_bot_installationEdge
        team_bot_installation {
          id
          json_settings
        }
        team {
          id
          alegre_bot: team_bot_installation(bot_identifier: "alegre") { # needed to refresh 'team.alegre_bot' and auto-hide/show Similarity tab
            id
            alegre_settings
          }
        }
        bot_user {
          id
          installed
          installation {
            id
            json_settings
          }
        }
      }
    `;
  }

  getVariables() {
    return { user_id: this.props.bot.dbid, team_id: this.props.team.dbid };
  }

  getConfigs() {
    return [
      {
        type: 'REQUIRED_CHILDREN',
        children: [Relay.QL`
          fragment on CreateTeamBotInstallationPayload {
            team_bot_installation {
              id
              json_settings
            }
          }`,
        ],
      },
      {
        type: 'RANGE_ADD',
        parentName: 'team',
        parentID: this.props.team.id,
        connectionName: 'team_bot_installations',
        edgeName: 'team_bot_installationEdge',
        rangeBehaviors: () => ('append'),
      },
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: {
          bot_user: this.props.bot.id,
        },
      },
    ];
  }
}

export default CreateTeamBotInstallationMutation;
