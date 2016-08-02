import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';

class CreateTagMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation createTag {
      createTag
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on CreateTagPayload {
        tagEdge,
        parent {
          annotations,
          tags,
        },
      }
    `;
  }

  getVariables() {
    var tag = this.props.annotation;
    return { tag: tag.tag, annotated_id: tag.annotated_id + '', annotated_type: tag.annotated_type };
  }

  static fragments = {
    parent: () => Relay.QL`fragment on Source { id }`, // FIXME: "Source" here should be polymorphic
  };

  getConfigs() {
    return [
      {
        type: 'RANGE_ADD',
        parentName: 'parent',
        parentID: this.props.annotated.id,
        connectionName: 'tags',
        edgeName: 'tagEdge',
        rangeBehaviors: {
          '': 'prepend'
        }
      },
      {
        type: 'RANGE_ADD',
        parentName: 'parent',
        parentID: this.props.annotated.id,
        connectionName: 'annotations',
        edgeName: 'tagEdge',
        rangeBehaviors: {
          '': 'prepend'
        }
      }
    ];
  }
}

export default CreateTagMutation;
