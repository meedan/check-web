import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';

class CreateMediaMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation createMedia {
      createMedia
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on CreateMediaPayload {
        media
      }
    `;
  }

  getVariables() {
    return { url: this.props.url, project_id: this.props.project_id };
  }

  getConfigs() {
    return [{
      type: 'REQUIRED_CHILDREN',
      children: [Relay.QL`
        fragment on CreateMediaPayload {
          media {
            dbid
          }
        }`
      ]
    }];
  }
}

export default CreateMediaMutation;
