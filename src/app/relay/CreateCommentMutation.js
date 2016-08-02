import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';

class CreateCommentMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation createComment {
      createComment
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on CreateCommentPayload {
        commentEdge,
        parent {
          annotations,
        },
      }
    `;
  }

  getVariables() {
    var comment = this.props.annotation;
    return { text: comment.text, annotated_id: comment.annotated_id + '', annotated_type: comment.annotated_type };
  }

  static fragments = {
    parent: () => Relay.QL`fragment on Source { id }`, // FIXME: "Source" here should be polymorphic
  };

  getConfigs() {
    return [{
      type: 'RANGE_ADD',
      parentName: 'parent',
      parentID: this.props.annotated.id,
      connectionName: 'annotations',
      edgeName: 'commentEdge',
      rangeBehaviors: {
        '': 'prepend'
      }
    }];
  }
}

export default CreateCommentMutation;
