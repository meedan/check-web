import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';

class UpdateTeamMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateTeam {
      updateTeam
    }`;
  }

  static fragments = {
     team: () => Relay.QL`fragment on Team { id,name,description }`,
   };
  getVariables() {
    return { id: this.props.id , name: this.props.name, description: this.props.description};
  }

  getFatQuery() {
    return Relay.QL`
      fragment on UpdateTeamPayload {
        team
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'REQUIRED_CHILDREN',
      children: [Relay.QL`
        fragment on UpdateTeamPayload {
          team {
            name,id,description
          }
        }`
      ]
    }];
}
}
export default UpdateTeamMutation;
