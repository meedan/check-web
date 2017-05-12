import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';

class CreateCommentMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation createComment {
      createComment
    }`;
  }

  getFatQuery() {
    let query = '';
    switch (this.props.parent_type) {
    case 'source':
      query = Relay.QL`fragment on CreateCommentPayload { commentEdge, source { annotations } }`;
      break;
    case 'project_media':
      query = Relay.QL`fragment on CreateCommentPayload { commentEdge, project_media { log, log_count } }`;
      break;
    }
    return query;
  }

  getOptimisticResponse() {
    const comment = {
      id: this.props.id,
      updated_at: new Date().toString(),
      annotation_type: 'comment',
      permissions: '{"destroy Annotation":true,"destroy Comment":true}',
      content: JSON.stringify({ text: this.props.annotation.text }),
      annotated_id: this.props.annotation.annotated_id,
      annotator: {
        name: this.props.annotator.name,
        profile_image: this.props.annotator.profile_image,
      },
      medias: {
        edges: [],
      },
    };

    return { commentEdge: { node: comment } };
  }

  getVariables() {
    const comment = this.props.annotation;
    return { text: comment.text, annotated_id: `${comment.annotated_id}`, annotated_type: comment.log_count };
  }

  getFiles() {
    return { file: this.props.image };
  }

  getConfigs() {
    const fieldIds = {};
    fieldIds[this.props.parent_type] = this.props.annotated.id;

    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: fieldIds,
      },
    ];
  }
}

export default CreateCommentMutation;
