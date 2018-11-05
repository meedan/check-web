import Relay from 'react-relay/classic';

class UserInvitationMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation { userInvitation }`;
  }

  getFatQuery() {
    return Relay.QL`fragment on UserInvitationPayload { success, team {id, invited_mails} }`;
  }

  getConfigs() {
    return [{
      type: 'REQUIRED_CHILDREN',
      children: [Relay.QL`
        fragment on UserInvitationPayload {
          success
          team {id, invited_mails}
        }
      `],
    }];
  }

  getVariables() {
    return {
      invitation: this.props.invitation,
      members: this.props.members,
    };
  }
}

export default UserInvitationMutation;
