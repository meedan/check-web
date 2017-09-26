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
        check_search_team { id, number_of_results },
        check_search_project { id, number_of_results }
      }
    `;
  }

  getVariables() {
    return {
      url: this.props.url,
      quote: this.props.quote,
      quote_attributions: this.props.quote_attributions
      project_id: this.props.project.dbid,
    };
  }

  getFiles() {
    return { file: this.props.image };
  }

  getConfigs() {
    return [
      {
        type: 'RANGE_ADD',
        parentName: 'check_search_team',
        parentID: this.props.project.team.search_id,
        connectionName: 'medias',
        edgeName: 'project_mediaEdge',
        rangeBehaviors: {
          '': 'prepend',
        },
      },
      {
        type: 'RANGE_ADD',
        parentName: 'check_search_project',
        parentID: this.props.project.search_id,
        connectionName: 'medias',
        edgeName: 'project_mediaEdge',
        rangeBehaviors: {
          '': 'prepend',
        },
      },
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: {
          check_search_team: this.props.project.team.search_id,
          check_search_project: this.props.project.search_id,
        },
      },
      {
        type: 'REQUIRED_CHILDREN',
        children: [Relay.QL`
          fragment on CreateProjectMediaPayload {
            project_media {
              dbid
            },
            check_search_team {
              id
            },
            check_search_project {
              id
            }
          }`,
        ],
      },
    ];
  }
}

export default CreateProjectMediaMutation;
