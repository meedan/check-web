import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';

class CreateProjectMediaMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation createProjectMedia {
      createProjectMedia
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on CreateProjectMediaPayload {
        project_media
      }
    `;
  }

  getVariables() {
    return { url: this.props.url, quote: this.props.quote, project_id: this.props.project_id };
  }

  getConfigs() {
    return [
      {
        type: 'REQUIRED_CHILDREN',
        children: [Relay.QL`
          fragment on CreateProjectMediaPayload {
            project_media {
              dbid
            }
          }`,
        ],
      },
    ];
  }
}

export default CreateProjectMediaMutation;
