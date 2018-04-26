import Relay from 'react-relay';

class DeleteTeamUserMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation destroyTeamUser {
      destroyTeamUser
    }`;
  }

  static fragments = {
    team_user: () => Relay.QL`fragment on TeamUser { id }`,
  };

  getVariables() {
    return { id: this.props.id };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on DestroyTeamUserPayload {
        deletedId,
        user { id }
      }
    `;
  }

  getConfigs() {
    if (this.props.user && this.props.user.id) {
      return [{
        type: 'NODE_DELETE',
        parentName: 'user',
        parentID: this.props.user.id,
        connectionName: 'team_users',
        deletedIDFieldName: 'deletedId',
      }];
    }
    return [];
  }
}

export default DeleteTeamUserMutation;
