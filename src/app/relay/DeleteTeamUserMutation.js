import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';

class DeleteTeamUserMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation destroyTeamUser {
      destroyTeamUser
    }`;
  }

  static fragments = {
    team_user: () => Relay.QL`fragment on TeamUser { id }`,
  };

  getVariables() {
    return { id: this.props.id };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on DestroyTeamUserPayload {
        deletedId
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'NODE_DELETE',
      parentName: this.props.parent_type,
      parentID: this.props.parentID,
      connectionName: 'users',
      deletedIDFieldName: 'deletedId',
    }];
  }
}

export default DeleteTeamUserMutation;
