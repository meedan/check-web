import Relay from 'react-relay/classic';

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
    if (this.props.accept_terms) {
      vars.accept_terms = this.props.accept_terms;
    }
    return vars;
  }

  getOptimisticResponse() {
    const response = {};

    if (this.props.accept_terms) {
      response.user = {
        id: this.props.current_user_id,
        accepted_terms: true,
      };
    }

    return response;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on UpdateUserPayload {
        user {
          id
          dbid
          accepted_terms
          current_team_id
          current_team {
            id
            dbid
          }
        }
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
