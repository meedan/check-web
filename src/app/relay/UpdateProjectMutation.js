import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';

class UpdateProjectMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateProject {
      updateProject
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on UpdateProjectPayload {
        project {
          id,
          title,
          get_slack_channel,
          description
        }
      }
    `;
  }

  getVariables() {
    return { title: this.props.title, description: this.props.description, id: this.props.id, set_slack_channel: this.props.slackChannel };
  }

  getConfigs() {
    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: { project: this.props.id }
      }
    ];
  }
}

export default UpdateProjectMutation;
