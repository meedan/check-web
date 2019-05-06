import Relay from 'react-relay/classic';

class UpdateTeamMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateTeam {
      updateTeam
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on UpdateTeamPayload {
        check_search_team { id, number_of_results },
        check_search_trash { id, number_of_results },
        team {
          name
          id
          description
          contacts
          avatar
          get_slack_notifications_enabled
          get_slack_webhook
          get_slack_channel
          get_disclaimer
          get_embed_tasks
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
    const vars = {};
    const options = {
      id: this.props.id,
      name: this.props.name,
      description: this.props.description,
      empty_trash: this.props.empty_trash,
      contact: this.props.contact,
      team_tasks: this.props.team_tasks,
      slack_notifications_enabled: this.props.slack_notifications_enabled,
      slack_webhook: this.props.slack_webhook,
      slack_channel: this.props.slack_channel,
      disclaimer: this.props.disclaimer,
      embed_tasks: this.props.embed_tasks,
    };
    Object.keys(options).forEach((key) => {
      if (options[key]) {
        vars[key] = options[key];
      }
    });
    return vars;
  }

  getFiles() {
    return {
      file: this.props.avatar,
    };
  }

  getOptimisticResponse() {
    if (this.props.empty_trash) {
      return {
        check_search_team: { id: this.props.search_id, number_of_results: 0 },
      };
    }
    return {};
  }

  getConfigs() {
    const configs = [
      {
        type: 'REQUIRED_CHILDREN',
        children: [Relay.QL`
          fragment on UpdateTeamPayload {
            team {
              name, id, description, avatar,
              get_slack_notifications_enabled,
              get_slack_webhook,
              get_slack_channel,
              get_disclaimer,
              get_embed_tasks,
              contacts(first: 1) { edges { node { web, location, phone } } }
            }
          }`,
        ],
      },
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: {
          team: this.props.id,
          public_team: this.props.public_id,
          check_search_team: this.props.search_id,
          check_search_trash: this.props.search_id,
        },
      },
    ];

    if (this.props.search_id) {
      configs.push({
        type: 'NODE_DELETE',
        parentName: 'check_search_team',
        parentID: this.props.search_id,
        connectionName: 'medias',
        deletedIDFieldName: 'affectedIds',
      });
    }

    return configs;
  }
}
export default UpdateTeamMutation;
