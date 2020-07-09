import Relay from 'react-relay/classic';

class BulkCreateProjectMediaProjectsMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation createProjectMediaProjects {
      createProjectMediaProjects
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
        medias_count: this.props.project.medias_count + this.props.projectMedias.length,
      },
    };
  }

  getVariables() {
    console.log('getVariables', this.props);
    const vars = [];
    this.props.projectMedias.forEach((projectMedia) => {
      vars.push({ project_media_id: projectMedia, project_id: this.props.project.dbid });
    });
    return vars;
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

export default BulkCreateProjectMediaProjectsMutation;
