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
        team {
          name, id, description, get_slack_notifications_enabled, get_slack_webhook, get_slack_channel, contacts
        }
      }
    `;
  }

  getVariables() {
    return { id: this.props.id,
      name: this.props.name,
      description: this.props.description,
      set_slack_notifications_enabled: this.props.set_slack_notifications_enabled,
      set_slack_webhook: this.props.set_slack_webhook,
      set_slack_channel: this.props.set_slack_channel,
      contact: this.props.contact };
  }

  getConfigs() {
    return [
      {
        type: 'REQUIRED_CHILDREN',
        children: [Relay.QL`
          fragment on UpdateTeamPayload {
            team {
              name, id, description, get_slack_notifications_enabled, get_slack_webhook, get_slack_channel,
              contacts(first: 1) { edges { node { web, location, phone } } }
            }
          }`,
        ],
      },
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: { team: this.props.id },
      },
    ];
  }
}
export default UpdateTeamMutation;
