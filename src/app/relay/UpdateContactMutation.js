import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';

class UpdateContactMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateContact {
      updateContact
    }`;
  }

  static fragments = {
     contact: () => Relay.QL`fragment on Contact { id,location,web,phone }`,
   };
  getVariables() {
    return { id: this.props.id, location: this.props.location, web: this.props.web, phone: this.props.phone };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on UpdateContactPayload {
        contact
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'REQUIRED_CHILDREN',
      children: [Relay.QL`
        fragment on UpdateContactPayload {
          contact {
            id,location,web,phone
          }
        }`,
      ],
    }];
  }
}
export default UpdateContactMutation;
