import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';

class UpdateStatusMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateStatus {
      updateStatus
    }`;
  }

  getFatQuery() {
    let query = '';
    switch (this.props.parent_type) {
    case 'source':
      query = Relay.QL`fragment on UpdateStatusPayload { statusEdge, source { log, log_count, id } }`;
      break;
    case 'project_media':
      query = Relay.QL`fragment on UpdateStatusPayload { statusEdge, project_media { log, id, last_status, log_count } }`;
      break;
    }
    return query;
  }

  /*
  getOptimisticResponse() {
    const status = {
      id: this.props.id,
      updated_at: new Date().toString(),
      annotation_type: 'status',
      permissions: '{"destroy Annotation":true,"destroy Status":true}',
      content: JSON.stringify({ status: this.props.annotation.status }),
      status: this.props.annotation.status,
      annotated_id: this.props.annotation.annotated_id,
      annotator: {
        name: this.props.annotator.name,
        profile_image: this.props.annotator.profile_image,
      },
      medias: {
        edges: [],
      },
    };

    const media = Object.assign({}, this.props.annotated);
    media.last_status = this.props.annotation.status;

    return { statusEdge: { node: status }, project_media: media };
  }
  */

  getVariables() {
    const status = this.props.annotation;
    return { id: status.status_id,
      status: status.status };
  }

  getConfigs() {
    const fieldIds = {};
    fieldIds[this.props.parent_type] = this.props.annotated.id;

    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: fieldIds,
      },
    ];
  }
}
export default UpdateStatusMutation;
