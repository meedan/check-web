import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';

class ResetPasswordMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation { resetPassword }`;
  }

  getFatQuery() {
    return Relay.QL`fragment on ResetPasswordPayload { success }`;
  }

  getConfigs() {
    return [];
  }

  getVariables() {
    return { email: this.props.email };
  }
}

export default ResetPasswordMutation;
