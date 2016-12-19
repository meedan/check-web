import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';

class CreateCommentMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation createComment {
      createComment
    }`;
  }

  getFatQuery() {
    var query = '';
    switch (this.props.parent_type) {
      case 'source':
        query = Relay.QL`fragment on CreateCommentPayload { commentEdge, source { annotations } }`;
        break;
      case 'media':
        query = Relay.QL`fragment on CreateCommentPayload { commentEdge, media { annotations, annotations_count } }`;
        break;
      case 'project':
        query = Relay.QL`fragment on CreateCommentPayload { commentEdge, project { annotations } }`;
        break;
    }
    return query;
  }

  getVariables() {
    var comment = this.props.annotation;
    var vars = { text: comment.text, annotated_id: comment.annotated_id + '', annotated_type: comment.annotated_type };
    var context = this.props.context;
    if (context && context.project) {
      vars.context_type = 'Project';
      vars.context_id = context.project.dbid.toString();
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
        edgeName: 'commentEdge',
        rangeBehaviors: {
          '': 'append'
        }
      },
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: fieldIds
      }
    ];
  }
}

export default CreateCommentMutation;
