import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';

class CreateTaskMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation createTask {
      createTask
    }`;
  }

  getFatQuery() {
    return Relay.QL`fragment on CreateTaskPayload { taskEdge, project_media { tasks, annotations, annotations_count } }`;
  }

  getVariables() {
    const { label, type, description, annotated_type, annotated_dbid } = this.props;
    return { label, type, description, annotated_type, annotated_id: annotated_dbid };
  }

  getConfigs() {
    const fieldIds = {};
    fieldIds['project_media'] = this.props.annotated_id;

    return [
      {
        type: 'RANGE_ADD',
        parentName: 'project_media',
        parentID: this.props.annotated_id,
        connectionName: 'tasks',
        edgeName: 'taskEdge',
        rangeBehaviors: calls => 'prepend',
      },
      {
        type: 'RANGE_ADD',
        parentName: 'project_media',
        parentID: this.props.annotated_id,
        connectionName: 'annotations',
        edgeName: 'taskEdge',
        rangeBehaviors: calls => 'prepend',
      },
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: fieldIds,
      },
    ];
  }
}

export default CreateTaskMutation;
