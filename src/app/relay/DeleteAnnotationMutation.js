import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';

class DeleteAnnotationMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation destroyAnnotation {
      destroyAnnotation
    }`;
  }

  static fragments = {
    annotation: () => Relay.QL`fragment on Annotation { id }`,
  };

  getVariables() {
    return { id: this.props.id };
  }
  
  getFatQuery() {
    return Relay.QL`
      fragment on DestroyAnnotationPayload {
        deletedId,
        parent {
          annotations,
          tags,
        },
      }
    `;
  }
  
  getConfigs() {
    return [
      {
        type: 'NODE_DELETE',
        parentName: 'parent',
        parentID: this.props.annotated.id,
        connectionName: 'tags',
        deletedIDFieldName: 'deletedId',
      },
      {
        type: 'NODE_DELETE',
        parentName: 'parent',
        parentID: this.props.annotated.id,
        connectionName: 'annotations',
        deletedIDFieldName: 'deletedId',
      }
    ];
  }
}

export default DeleteAnnotationMutation;
