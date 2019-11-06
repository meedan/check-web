import Relay from 'react-relay/classic';

class CreateProjectSourceMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation { createProjectSource }`;
  }

  getFatQuery() {
    return Relay.QL`fragment on CreateProjectSourcePayload {
      project_sourceEdge,
      project_source,
      check_search_team { id, number_of_results },
      check_search_project { id, number_of_results }
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
      project_id: this.props.project.dbid,
      name: this.props.source_name,
      url: this.props.source_url,
    };
  }
}

export default CreateProjectSourceMutation;
