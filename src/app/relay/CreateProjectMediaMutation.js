import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';

class CreateProjectMediaMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation createProjectMedia {
      createProjectMedia
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on CreateProjectMediaPayload {
        project_mediaEdge,
        project_media,
        project { project_medias },
        check_search { id, number_of_results }
      }
    `;
  }

  getVariables() {
    return { url: this.props.url, quote: this.props.quote, project_id: this.props.project.dbid };
  }

  getFiles() {
    return { file: this.props.image };
  }

  getConfigs() {
    return [
      {
        type: 'RANGE_ADD',
        parentName: 'project',
        parentID: this.props.project.id,
        connectionName: 'project_medias',
        edgeName: 'project_mediaEdge',
        rangeBehaviors: {
          '': 'prepend',
        },
      },
      {
        type: 'RANGE_ADD',
        parentName: 'check_search',
        parentID: this.props.project.team.search_id,
        connectionName: 'medias',
        edgeName: 'project_mediaEdge',
        rangeBehaviors: {
          '': 'prepend',
        },
      },
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: { 'check_search' : this.props.project.team.search_id },
      },
      {
        type: 'REQUIRED_CHILDREN',
        children: [Relay.QL`
          fragment on CreateProjectMediaPayload {
            project_media {
              dbid
            }
          }`,
        ],
      },
      {
        type: 'REQUIRED_CHILDREN',
        children: [Relay.QL`
          fragment on CreateProjectMediaPayload {
            check_search {
              id
            }
          }`,
        ],
      },
    ];
  }
}

export default CreateProjectMediaMutation;
