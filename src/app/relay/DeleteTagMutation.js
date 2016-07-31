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
    return Relay.QL`
      fragment on DestroyTagPayload {
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

export default DeleteTagMutation;
