import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';

class CreateTeamMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation createTeam {
      createTeam
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on CreateTeamPayload {
        team
      }
    `;
  }

  getVariables() {
    return { name: this.props.name, description: this.props.description, slug: this.props.slug };
  }

  getConfigs() {
    return [{
      type: 'REQUIRED_CHILDREN',
      children: [Relay.QL`
        fragment on CreateTeamPayload {
          team {
            id,
            name,
            dbid,
            slug,
            description
          }
        }`,
      ],
    }];
  }
}

export default CreateTeamMutation;
