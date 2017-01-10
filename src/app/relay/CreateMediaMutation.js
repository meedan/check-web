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
        mediaEdge,
        media,
        project { medias }
      }
    `;
  }

  getVariables() {
    return { url: this.props.url, quote: this.props.quote, project_id: this.props.project.dbid };
  }

  getConfigs() {
    return [
      {
        type: 'RANGE_ADD',
        parentName: 'project',
        parentID: this.props.project.id,
        connectionName: 'project_medias',
        edgeName: 'mediaEdge',
        rangeBehaviors: {
          '': 'prepend',
        },
      },
      {
        type: 'REQUIRED_CHILDREN',
        children: [Relay.QL`
          fragment on CreateMediaPayload {
            media {
              dbid
              pm_dbid
            }
          }`,
        ],
      },
    ];
  }
}

export default CreateMediaMutation;
