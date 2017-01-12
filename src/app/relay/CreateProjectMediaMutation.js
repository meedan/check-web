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
        type: 'RANGE_ADD',
        parentName: 'project',
        parentID: this.props.project_id,
        connectionName: 'project_medias',
        edgeName: 'project_mediaEdge',
        rangeBehaviors: {
          '': 'prepend',
        },
      },
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
