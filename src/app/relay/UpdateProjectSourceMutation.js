import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';

class UpdateProjectSourceMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateProjectSource {
      updateProjectSource
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on UpdateProjectSourcePayload {
        project_source {
          project_id
        }
        project {
          project_sources
        }
      }
    `;
  }

  getVariables() {
    const vars = {
      id: this.props.id,
      project_id: this.props.project_id,
      refresh_accounts: this.props.refresh_accounts,
    };
    if (this.props.srcProj) {
      vars.previous_project_id = this.props.srcProj.dbid;
    }
    return vars;
  }

  getConfigs() {
    const ids = { project_source: this.props.id };

    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: ids,
      },
      {
        type: 'REQUIRED_CHILDREN',
        children: [Relay.QL`
          fragment on UpdateProjectSourcePayload {
            project {
              project_sources(first: 20) {
                edges {
                  node {
                    id
                  }
                }
              }
            },
          }`,
        ],
      },
    ];
  }
}

export default UpdateProjectSourceMutation;
