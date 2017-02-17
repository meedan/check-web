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
    return { id: task.id, response: JSON.stringify({ annotation_type: task.annotation_type, set_fields: JSON.stringify(task.fields) }) };
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

