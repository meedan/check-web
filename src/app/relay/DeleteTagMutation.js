import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';

class DeleteTagMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation destroyTag {
      destroyTag
    }`;
  }

  static fragments = {
    tag: () => Relay.QL`fragment on Tag { id }`,
  };

  getVariables() {
    return { id: this.props.id };
  }
  
  getFatQuery() {
    var query = '';
    switch (this.props.parent_type) {
      case 'source':
        query = Relay.QL`fragment on DestroyTagPayload { deletedId, source { annotations, tags } }`;
        break;
      case 'media':
        query = Relay.QL`fragment on DestroyTagPayload { deletedId, media { annotations, tags } }`;
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

export default DeleteTagMutation;
