import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import userFragment from './userFragment';

class UpdateUserMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateUser {
      updateUser
    }`;
  }

  static fragments = {
    user: () => userFragment
  };
  
  getVariables() {
    return { id: Checkdesk.currentUser.id, current_team_id: this.props.current_team_id };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on UpdateUserPayload {
        user
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'REQUIRED_CHILDREN',
      children: [Relay.QL`
        fragment on UpdateUserPayload {
          user {
            id,
            current_team_id
          }
        }`
      ]
    }];
  }
}

export default UpdateUserMutation;
