import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';

class CreateTagMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation createTag {
      createTag
    }`;
  }

  getFatQuery() {
    var query = '';
    switch (this.props.parent_type) {
      case 'source':
        query = Relay.QL`fragment on CreateTagPayload { tagEdge, source { annotations, tags } }`;
        break;
      case 'media':
        query = Relay.QL`fragment on CreateTagPayload { tagEdge, media { annotations, tags } }`;
        break;
    }
    return query;
  }

  getVariables() {
    var tag = this.props.annotation;
    var vars = { tag: tag.tag, annotated_id: tag.annotated_id + '', annotated_type: tag.annotated_type };
    if (Checkdesk.context.project) {
      vars.context_type = 'Project';
      vars.context_id = Checkdesk.context.project.dbid.toString();
    }
    return vars;
  }

  getConfigs() {
    return [
      {
        type: 'RANGE_ADD',
        parentName: this.props.parent_type,
        parentID: this.props.annotated.id,
        connectionName: 'tags',
        edgeName: 'tagEdge',
        rangeBehaviors: {
          '': 'prepend'
        }
      },
      {
        type: 'RANGE_ADD',
        parentName: this.props.parent_type,
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
