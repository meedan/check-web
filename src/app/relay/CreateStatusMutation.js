import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';

class CreateStatusMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation createStatus {
      createStatus
    }`;
  }

  getFatQuery() {
    var query = '';
    switch (this.props.parent_type) {
      case 'source':
        query = Relay.QL`fragment on CreateStatusPayload { statusEdge, source { annotations, id } }`;
        break;
      case 'media':
        query = Relay.QL`fragment on CreateStatusPayload { statusEdge, media { annotations, id, last_status } }`;
        break;
    }
    return query;
  }

  getVariables() {
    var status = this.props.annotation;
    var vars = { status: status.status, annotated_id: status.annotated_id + '', annotated_type: status.annotated_type };
    if (Checkdesk.context.project) {
      vars.context_type = 'Project';
      vars.context_id = Checkdesk.context.project.dbid.toString();
    }
    return vars;
  }

  getConfigs() {
    var fieldIds = {};
    fieldIds[this.props.parent_type] = this.props.annotated.id;

    return [
      {
        type: 'RANGE_ADD',
        parentName: this.props.parent_type,
        parentID: this.props.annotated.id,
        connectionName: 'annotations',
        edgeName: 'statusEdge',
        rangeBehaviors: {
          '': 'prepend'
        }
      },
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: fieldIds
      }
    ];
  }
}

export default CreateStatusMutation;
