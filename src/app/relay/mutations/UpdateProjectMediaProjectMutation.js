import Relay from 'react-relay/classic';

class UpdateProjectMediaProjectMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateProjectMediaProject {
      updateProjectMediaProject
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on UpdateProjectMediaProjectPayload {
        project_media_projectEdge,
        check_search_project { id, number_of_results, medias },
        project {
          id
          dbid
          title
          medias_count
          search_id
          team {
            slug
          }
        }
      }
    `;
  }

  getVariables() {
    const vars = {
      id: this.props.id,
      project_id: this.props.project_id,
    };
    // if (this.props.srcProj) {
    //   vars.previous_project_id = this.props.srcProj.dbid;
    // }
    return vars;
  }

  getConfigs() {
    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: {
          check_search_project: this.props.srcProj.search_id,
          project: this.props.srcProj.id,
        },
      },
    ];
  }
}

export default UpdateProjectMediaProjectMutation;
