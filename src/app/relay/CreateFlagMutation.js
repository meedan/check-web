import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';

class CreateFlagMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation createFlag {
      createFlag
    }`;
  }

  getFatQuery() {
    let query = '';
    switch (this.props.parent_type) {
    case 'source':
      query = Relay.QL`fragment on CreateFlagPayload { flagEdge, source { annotations } }`;
      break;
    case 'media':
      query = Relay.QL`fragment on CreateFlagPayload { flagEdge, media { annotations, annotations_count } }`;
      break;
    }
    return query;
  }

  getVariables() {
    const flag = this.props.annotation;
    const vars = { flag: flag.flag, annotated_id: `${flag.annotated_id}`, annotated_type: flag.annotated_type };
    const context = this.props.context;
    if (context && context.project) {
      vars.context_type = 'Project';
      vars.context_id = context.project.dbid.toString();
    }
    return vars;
  }

  getConfigs() {
    const fieldIds = {};
    fieldIds[this.props.parent_type] = this.props.annotated.id;

    return [
      {
        type: 'RANGE_ADD',
        parentName: this.props.parent_type,
        parentID: this.props.annotated.id,
        connectionName: 'annotations',
        edgeName: 'flagEdge',
        rangeBehaviors: {
          '': 'prepend',
        },
      },
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: fieldIds,
      },
    ];
  }
}

export default CreateFlagMutation;
