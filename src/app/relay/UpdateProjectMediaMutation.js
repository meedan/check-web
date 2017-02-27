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
    let vars = {
      id: this.props.id,
      embed: this.props.embed,
      project_id: this.props.project_id
    };
    if (this.props.srcProj) {
      vars['previous_project_id'] = this.props.srcProj.dbid;
    }
    return vars;
  }

  getConfigs() {
    let ids = { project_media: this.props.id };
    if (this.props.srcProj) {
      ids['project_was'] = this.props.srcProj.id;
    }
    if (this.props.dstProj) {
      ids['project'] = this.props.dstProj.id;
    }

    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: ids
      }
    ];
  }
}

export default UpdateProjectMediaMutation;
