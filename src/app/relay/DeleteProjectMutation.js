import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';

class DeleteProjectMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation destroyProject {
      destroyProject
    }`;
  }

  static fragments = {
    project: () => Relay.QL`fragment on Project { id }`,
  };

  getVariables() {
    return { id: this.props.id };
  }

  getFatQuery() {
    return Relay.QL`fragment on DestroyProjectPayload { deletedId, team { projects } }`;
  }

  getConfigs() {
    return [
      {
        type: 'NODE_DELETE',
        parentName: 'team',
        parentID: this.props.teamId,
        connectionName: 'projects',
        deletedIDFieldName: 'deletedId',
      },
    ];
  }
}

export default DeleteProjectMutation;
