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
        team_bot_installation
        team {
          id
        }
        bot_user {
          id
          installed
          installation {
            id
          }
        }
      }
    `;
  }

  getVariables() {
    return { team_id: this.props.team.dbid, user_id: this.props.bot.dbid };
  }

  getConfigs() {
    return [
      {
        type: 'REQUIRED_CHILDREN',
        children: [Relay.QL`
          fragment on CreateTeamBotInstallationPayload {
            team_bot_installation {
              id
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
