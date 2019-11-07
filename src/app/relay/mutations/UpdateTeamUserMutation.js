import Relay from 'react-relay/classic';

class UpdateTeamUserMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateTeamUser {
      updateTeamUser
    }`;
  }

  static fragments = {
    team_user: () => Relay.QL`fragment on TeamUser { id, team_id, user_id, status, role }`,
  };

  getVariables() {
    return {
      team_id: this.props.team_id,
      user_id: this.props.user_id,
      status: this.props.status,
      id: this.props.id,
      role: this.props.role,
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on UpdateTeamUserPayload {
        team,
        team_user {
          id, team_id, user_id, status, role,
        },
        team_userEdge,
      }
    `;
  }

  getConfigs() {
    const configs = [{
      type: 'REQUIRED_CHILDREN',
      children: [Relay.QL`
        fragment on UpdateTeamUserPayload {
          team_user {
            id, team_id, user_id, status, role,
            team {
              join_requests (first: 1000) { edges { node { status } }}
            }
          }
        }`,
      ],
    }];

    if (this.props.team) {
      configs.push({
        type: 'RANGE_ADD',
        parentName: 'team',
        parentID: this.props.team.id,
        connectionName: 'team_users',
        edgeName: 'team_userEdge',
        rangeBehaviors: () => ('prepend'),
      });
    }

    return configs;
  }
}

export default UpdateTeamUserMutation;
