import Relay from 'react-relay';

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
    let { role } = this.props;
    if (typeof role !== 'undefined') {
      role = role.value;
    }
    return {
      team_id: this.props.team_id,
      user_id: this.props.user_id,
      status: this.props.status,
      id: this.props.id,
      role,
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on UpdateTeamUserPayload {
        team_user
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'REQUIRED_CHILDREN',
      children: [Relay.QL`
        fragment on UpdateTeamUserPayload {
          team_user {
            id, team_id, user_id, status, role
          }
        }`,
      ],
    }];
  }
}

export default UpdateTeamUserMutation;
