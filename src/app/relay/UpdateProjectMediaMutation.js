import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';

class UpdateProjectMediaMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateProjectMedia {
      updateProjectMedia
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on UpdateProjectMediaPayload {
        project_media {
          project_id,
          overridden,
          embed,
          dbid,
          log,
          log_count,
          archived,
          permissions,
          tasks(first: 10000) {
            edges {
              node {
                permissions
                first_response {
                  permissions
                }
              }
            }
          }
          team {
            slug
          }
          project {
            title
          }
        }
        project {
          project_medias
        }
        project_was {
          project_medias
        }
      }
    `;
  }

  getVariables() {
    const vars = {
      id: this.props.id,
      embed: this.props.embed,
      project_id: this.props.project_id,
      refresh_media: this.props.refresh_media,
      update_mt: this.props.update_mt,
      update_keep: this.props.update_keep,
      archived: this.props.archived,
    };
    if (this.props.srcProj) {
      vars.previous_project_id = this.props.srcProj.dbid;
    }
    return vars;
  }

  getConfigs() {
    const ids = { project_media: this.props.id };
    if (this.props.srcProj) {
      ids.project_was = this.props.srcProj.id;
    }
    if (this.props.dstProj) {
      ids.project = this.props.dstProj.id;
    }

    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: ids,
      },
      {
        type: 'REQUIRED_CHILDREN',
        children: [Relay.QL`
          fragment on UpdateProjectMediaPayload {
            project {
              project_medias(first: 20) {
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

export default UpdateProjectMediaMutation;
