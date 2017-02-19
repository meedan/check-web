import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';

class UpdateTaskMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateTask {
      updateTask
    }`;
  }

 getFatQuery() {
   return Relay.QL`fragment on UpdateTaskPayload { taskEdge, project_media { tasks, annotations, id, annotations_count } }`;
 }

 getVariables() {
    const task = this.props.task;
    let params = { id: task.id };
    if (task.annotation_type && task.fields) {
      params.response = JSON.stringify({ annotation_type: task.annotation_type, set_fields: JSON.stringify(task.fields) });
    }
    else if (task.label) {
      params.label = task.label;
      params.description = task.description;
    }
    return params;
  }

  getConfigs() {
    const fieldIds = {};
    fieldIds['project_media'] = this.props.annotated.id;

    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: fieldIds,
      },
    ];
  }
}
export default UpdateTaskMutation;

