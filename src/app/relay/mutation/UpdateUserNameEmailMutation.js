import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';

class UpdateUserNameEmailMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation { updateUser }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on UpdateUserPayload {
        user {
          id,
          name,
          email,
        }
      }
    `;
  }

  getVariables() {
    return { id: this.props.id, name: this.props.name, email: this.props.email };
  }

  getConfigs() {
    return [];
  }
}

export default UpdateUserNameEmailMutation;
