import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';

class CreateProjectSourceMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation { createProjectSource }`;
  }

  getFatQuery() {
    return Relay.QL`fragment on CreateProjectSourcePayload {
      project_source {
         id,
         dbid,
         team {
            dbid,
            name
          },
         source {
           id,
           dbid
         }
      }
    }`;
  }

  getConfigs() {
    return [
      {
        type: 'REQUIRED_CHILDREN',
        children: [Relay.QL`
          fragment on CreateProjectSourcePayload {
            project_source {
              dbid,
              team {
                dbid,
                name
              },
              source {
                id,
                dbid
              }
            },
          }`,
        ],
      },
    ];
  }

  getVariables() {
    return {
      project_id: this.props.project_id,
      name: this.props.source_name,
      url: this.props.source_url,
    };
  }
}

export default CreateProjectSourceMutation;
