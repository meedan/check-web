import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';

class CreateTeamUserMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation createTeamUser {
      createTeamUser
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on CreateTeamUserPayload {
        team_user
      }
    `;
  }

  getVariables() {
    return { team_id: this.props.team_id,
            user_id: this.props.user_id,
            status: this.props.status,   };
  }

  getConfigs() {
    return [{
      type: 'REQUIRED_CHILDREN',
      children: [Relay.QL`
        fragment on CreateTeamUserPayload {
          team_user {
            id,status
          }
        }`
      ]
    }];
  }
}

export default CreateTeamUserMutation;
