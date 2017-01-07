import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';

class CreateTagMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation createTag {
      createTag
    }`;
  }

  getFatQuery() {
    let query = '';
    switch (this.props.parent_type) {
    case 'source':
      query = Relay.QL`fragment on CreateTagPayload { tagEdge, source { annotations, tags } }`;
      break;
    case 'media':
      query = Relay.QL`fragment on CreateTagPayload { tagEdge, media { annotations, tags, annotations_count } }`;
      break;
    }
    return query;
  }

  getVariables() {
    const tag = this.props.annotation;
    const vars = { tag: tag.tag, annotated_id: `${tag.annotated_id}`, annotated_type: tag.annotated_type };
    const context = this.props.context;
    if (context && context.project) {
      vars.context_type = 'Project';
      vars.context_id = context.project.dbid.toString();
    }
    return vars;
  }

  getOptimisticResponse() {
    const tag = {
      id: this.props.id,
      created_at: new Date().toString(),
      annotation_type: 'tag',
      permissions: '{"destroy Annotation":true,"destroy Tag":true}',
      content: JSON.stringify({ tag: this.props.annotation.tag }),
      tag: this.props.annotation.tag,
      annotated_id: this.props.annotation.annotated_id,
      annotator: {
        name: this.props.annotator.name,
        profile_image: this.props.annotator.profile_image,
      },
      medias: {
        edges: [],
      },
    };

    return { tagEdge: { node: tag } };
  }

  getConfigs() {
    const fieldIds = {};
    fieldIds[this.props.parent_type] = this.props.annotated.id;

    return [
      {
        type: 'RANGE_ADD',
        parentName: this.props.parent_type,
        parentID: this.props.annotated.id,
        connectionName: 'tags',
        edgeName: 'tagEdge',
        rangeBehaviors: calls => 'prepend',
      },
      {
        type: 'RANGE_ADD',
        parentName: this.props.parent_type,
        parentID: this.props.annotated.id,
        connectionName: 'annotations',
        edgeName: 'tagEdge',
        rangeBehaviors: calls => 'prepend',
      },
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: fieldIds,
      },
    ];
  }
}

export default CreateTagMutation;
