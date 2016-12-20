import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';

class CreateAccountMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation createAccount {
      createAccount
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on CreateAccountPayload {
        account
      }
    `;
  }

  getVariables() {
    return { url: this.props.url };
  }

  getConfigs() {
    return [{
      type: 'REQUIRED_CHILDREN',
      children: [Relay.QL`
        fragment on CreateAccountPayload {
          account {
            source_id
          }
        }`,
      ],
    }];
  }
}

export default CreateAccountMutation;
