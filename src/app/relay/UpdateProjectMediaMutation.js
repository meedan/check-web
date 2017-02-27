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
          project_id,
          log,
          annotations_count
        }
        project {
          project_medias
        }
        project_was {
          project_medias
        }
      }
    `;
  }

  getVariables() {
    return {
      id: this.props.id,
      embed: this.props.embed,
      project_id: this.props.project_id,
      previous_project_id: this.props.srcProj.dbid
    };
  }

  getConfigs() {
    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: { project_media: this.props.id, project_was: this.props.srcProj.id, project: this.props.dstProj.id }
      }
    ];
  }
}

export default UpdateProjectMediaMutation;
