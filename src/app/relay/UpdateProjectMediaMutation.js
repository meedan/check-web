import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';

class UpdateProjectMediaMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateProjectMedia {
      updateProjectMedia
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on UpdateProjectMediaPayload {
        project_media {
          id,
          project_id
        }
      }
    `;
  }

  getVariables() {
    return {
      id: this.props.id,
      // url: this.props.url
      embed: this.props.embed,
      project_id: this.props.project_id
    };
  }

  getConfigs() {
    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: { project_media: this.props.id }
      },
      // {
      //   type: 'RANGE_DELETE',
      //   parentName: 'project',
      //   parentID: this.props.srcProj.id,
      //   connectionName: 'project_medias',
      //   deletedIDFieldName: ['project_media','id'],
      //   pathToConnection: ['project','project_medias']
      // }
    ];
  }
}

export default UpdateProjectMediaMutation;
