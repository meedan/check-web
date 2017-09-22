import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';

class DeleteAnnotationMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation destroyAnnotation {
      destroyAnnotation
    }`;
  }

  getVariables() {
    return { id: this.props.id };
  }

  getFatQuery() {
    let query = '';
    switch (this.props.parent_type) {
    case 'source':
      query = Relay.QL`fragment on DestroyAnnotationPayload { deletedId, source { log, tags, log_count } }`;
      break;
    case 'project_media':
      query = Relay.QL`fragment on DestroyAnnotationPayload { deletedId, project_media { log, tags, tasks, embed, log_count, last_status, last_status_obj { id } } }`;
      break;
    case 'project_source':
      query = Relay.QL`fragment on DestroyAnnotationPayload { deletedId, project_source { id, source { log, log_count, tags } } }`;
      break;
    }
    return query;
  }

  getOptimisticResponse() {
    return { deletedId: this.props.id };
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

export default DeleteAnnotationMutation;
