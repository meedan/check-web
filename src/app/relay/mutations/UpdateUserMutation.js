import Relay from 'react-relay';
import userFragment from '../userFragment';

class UpdateUserMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateUser {
      updateUser
    }`;
  }

  static fragments = {
    user: () => userFragment,
  };

  getVariables() {
    return { id: this.props.current_user_id, current_team_id: this.props.current_team_id };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on UpdateUserPayload {
        user
      }
    `;
  }

  getConfigs() {
    const fieldIds = { user: this.props.current_user_id };

    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: fieldIds,
    }];
  }
}

export default UpdateUserMutation;
