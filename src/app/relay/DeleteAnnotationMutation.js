import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';

class DeleteAnnotationMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation destroyAnnotation {
      destroyAnnotation
    }`;
  }

  getVariables() {
    return { id: this.props.id };
  }
  
  getFatQuery() {
    var query = '';
    switch (this.props.parent_type) {
      case 'source':
        query = Relay.QL`fragment on DestroyAnnotationPayload { deletedId, source { annotations, tags } }`;
        break;
      case 'media':
        query = Relay.QL`fragment on DestroyAnnotationPayload { deletedId, media { annotations, tags } }`;
        break;
      case 'project':
        query = Relay.QL`fragment on DestroyAnnotationPayload { deletedId, project { annotations } }`;
        break;
    }
    return query;
  }
  
  getConfigs() {
    return [
      {
        type: 'NODE_DELETE',
        parentName: this.props.parent_type,
        parentID: this.props.annotated.id,
        connectionName: 'tags',
        deletedIDFieldName: 'deletedId',
      },
      {
        type: 'NODE_DELETE',
        parentName: this.props.parent_type,
        parentID: this.props.annotated.id,
        connectionName: 'annotations',
        deletedIDFieldName: 'deletedId',
      }
    ];
  }
}

export default DeleteAnnotationMutation;
