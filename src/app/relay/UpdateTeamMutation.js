import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';

class UpdateTeamMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateTeam {
      updateTeam
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on UpdateTeamPayload {
        check_search_team { id },
        team {
          name
          id
          description
          get_slack_notifications_enabled
          get_slack_webhook
          get_slack_channel
          contacts
          avatar
        }
        public_team {
          avatar
          name
          description
        }
      }
    `;
  }

  getVariables() {
    return {
      id: this.props.id,
      name: this.props.name,
      description: this.props.description,
      set_slack_notifications_enabled: this.props.set_slack_notifications_enabled,
      set_slack_webhook: this.props.set_slack_webhook,
      set_slack_channel: this.props.set_slack_channel,
      empty_trash: this.props.empty_trash,
      contact: this.props.contact,
    };
  }

  getFiles() {
    return {
      file: this.props.avatar,
    };
  }

  getConfigs() {
    return [
      {
        type: 'REQUIRED_CHILDREN',
        children: [Relay.QL`
          fragment on UpdateTeamPayload {
            team {
              name, id, description, get_slack_notifications_enabled, get_slack_webhook, get_slack_channel, avatar,
              contacts(first: 1) { edges { node { web, location, phone } } }
            }
          }`,
        ],
      },
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: { team: this.props.id, public_team: this.props.public_id },
      },
      {
        type: 'NODE_DELETE',
        parentName: 'check_search_team',
        parentID: this.props.search_id,
        connectionName: 'medias',
        deletedIDFieldName: 'affectedIds',
      },
    ];
  }
}
export default UpdateTeamMutation;
