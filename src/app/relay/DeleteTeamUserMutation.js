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
        deletedId
      }
    `;
  }

  getConfigs() {
    return [];
  }
}

export default DeleteTeamUserMutation;
