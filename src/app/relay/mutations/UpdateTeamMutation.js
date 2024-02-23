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
        check_search_spam { id, number_of_results },
        team {
          name
          id
          description
          avatar
          get_shorten_outgoing_urls
          get_outgoing_urls_utm_code
          get_report
          get_rules
          public_team
        }
        public_team {
          id
          avatar
          name
          description
          trash_count
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
      report: this.props.report,
      rules: this.props.rules,
      shorten_outgoing_urls: this.props.shorten_outgoing_urls,
      outgoing_urls_utm_code: this.props.outgoing_urls_utm_code,
    };
    Object.keys(options).forEach((key) => {
      if (options[key] !== undefined) {
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
        check_search_team: {
          id: this.props.search_id,
          number_of_results: 0,
        },
        team: {
          id: this.props.id,
        },
        public_team: {
          id: this.props.public_id,
          trash_count: 0,
        },
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
              get_shorten_outgoing_urls,
              get_outgoing_urls_utm_code,
              get_report,
              get_rules,
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
          check_search_spam: this.props.search_id,
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
