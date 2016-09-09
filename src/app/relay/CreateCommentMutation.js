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
        query = Relay.QL`fragment on CreateCommentPayload { commentEdge, media { annotations } }`;
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
    if (Checkdesk.context.project) {
      vars.context_type = 'Project';
      vars.context_id = Checkdesk.context.project.dbid.toString();
    }
    return vars;
  }

  getConfigs() {
    return [{
      type: 'RANGE_ADD',
      parentName: this.props.parent_type,
      parentID: this.props.annotated.id,
      connectionName: 'annotations',
      edgeName: 'commentEdge',
      rangeBehaviors: {
        '': 'append'
      }
    }];
  }
}

export default CreateCommentMutation;
