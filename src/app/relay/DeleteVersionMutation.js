import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';

class DeleteVersionMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation destroyVersion {
      destroyVersion
    }`;
  }

  getVariables() {
    return { id: this.props.id };
  }

  getFatQuery() {
    let query = '';
    switch (this.props.parent_type) {
    case 'source':
      query = Relay.QL`fragment on DestroyVersionPayload { deletedId, source { annotations } }`;
      break;
    case 'project_media':
      query = Relay.QL`fragment on DestroyVersionPayload { deletedId, project_media { annotations, last_status, annotations_count, last_status, last_status_obj { id } } }`;
      break;
    }
    return query;
  }

  getConfigs() {
    const fieldIds = {};
    fieldIds[this.props.parent_type] = this.props.annotated.id;

    return [
      {
        type: 'NODE_DELETE',
        parentName: this.props.parent_type,
        parentID: this.props.annotated.id,
        connectionName: 'annotations',
        deletedIDFieldName: 'deletedId',
      },
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: fieldIds,
      },
    ];
  }
}

export default DeleteVersionMutation;
