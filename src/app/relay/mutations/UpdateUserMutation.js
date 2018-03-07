import Relay from 'react-relay';

class UpdateUserMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateUser {
      updateUser
    }`;
  }

  getVariables() {
    const vars = { id: this.props.current_user_id };
    if (this.props.current_team_id) {
      vars.current_team_id = this.props.current_team_id;
    }
    if (this.props.current_project_id) {
      vars.current_project_id = this.props.current_project_id;
    }
    return vars;
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
