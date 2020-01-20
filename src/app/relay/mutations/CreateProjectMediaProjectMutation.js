import Relay from 'react-relay/classic';

class CreateProjectMediaProjectMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation createProject {
      createProjectMediaProject
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on CreateProjectMediaProjectPayload {
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

  getOptimisticResponse() {
    return {
      project: {
        id: this.props.project.id,
        medias_count: this.props.project.medias_count + 1,
      },
    };
  }

  getVariables() {
    return {
      project_id: this.props.project.dbid,
      project_media_id: this.props.project_media.dbid,
    };
  }

  getConfigs() {
    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: {
          check_search_project: this.props.project.search_id,
          project: this.props.project.id,
        },
      },
    ];
  }
}

export default CreateProjectMediaProjectMutation;
