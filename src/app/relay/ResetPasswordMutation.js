import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';

class ResetPasswordMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation { resetPassword }`;
  }

  getFatQuery() {
    return Relay.QL`fragment on ResetPasswordPayload { success, expiry }`;
  }

  getConfigs() {
    return [{
      type: 'REQUIRED_CHILDREN',
      children: [Relay.QL`
        fragment on ResetPasswordPayload {
          success
          expiry
        }
      `]
    }];
  }

  getVariables() {
    return {email: this.props.email};
  }
}

export default ResetPasswordMutation;
