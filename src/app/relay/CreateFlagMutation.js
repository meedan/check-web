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

  getOptimisticResponse() {
    const flag = {
      id: this.props.id,
      created_at: new Date().toString(),
      annotation_type: 'flag',
      permissions: '{"destroy Annotation":true,"destroy Flag":true}',
      content: JSON.stringify({ flag: this.props.annotation.flag }),
      annotated_id: this.props.annotation.annotated_id,
      annotator: {
        name: this.props.annotator.name,
        profile_image: this.props.annotator.profile_image
      },
      medias: {
        edges: []
      }
    };
    
    return { flagEdge: { node: flag }};
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
        rangeBehaviors: (calls) => {
          return 'prepend';
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
