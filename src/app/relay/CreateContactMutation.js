import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';

class CreateContactMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation createContact {
      createContact
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on CreateContactPayload {
        contact
      }
    `;
  }

  getVariables() {
    return { team_id: this.props.team_id, web: this.props.web, phone: this.props.phone, location: this.props.location };
  }

  getConfigs() {
    return [{
      type: 'REQUIRED_CHILDREN',
      children: [Relay.QL`
        fragment on CreateContactPayload {
          contact {
            team_id,
            web,
            phone,
            location
          }
        }`
      ]
    }];
  }
}

export default CreateContactMutation;
