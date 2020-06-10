import Relay from 'react-relay/classic';

class UpdateTeamUserMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateTeamUser {
      updateTeamUser
    }`;
  }

  getVariables() {
    return {
      id: this.props.teamUser.id,
      status: this.props.status,
      role: this.props.role,
    };
  }

  static fragments = {
    team: () => Relay.QL`
      fragment on Team {
        id
      }
    `,
    teamUser: () => Relay.QL`
      fragment on TeamUser {
        id
        user {
          id
        }
      }
    `,
  };

  getFatQuery() {
    return Relay.QL`
      fragment on UpdateTeamUserPayload {
        team_userEdge
        team_user {
          role
          status
        }
        user {
          number_of_teams
          team_ids
          teams
          team_users
          user_teams
        }
        team {
          invited_mails
          join_requests
          members_count
          team_users
          users
        }
      }
    `;
  }

  getConfigs() {
    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: {
          team_user: this.props.teamUser.id,
          team: this.props.team.id,
          user: this.props.teamUser.user.id,
        },
      },
    ];
  }
}

export default UpdateTeamUserMutation;
