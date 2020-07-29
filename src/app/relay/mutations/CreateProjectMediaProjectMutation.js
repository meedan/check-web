import Relay from 'react-relay/classic';

class CreateProjectMediaProjectMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation createProjectMediaProject {
      createProjectMediaProject
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on CreateProjectMediaProjectPayload {
        project { id, medias_count, dbid, title, team { slug } }
        check_search_project { id, number_of_results },
        project_media { id, project_ids }
      }
    `;
  }

  getOptimisticResponse() {
    return {
      project: {
        id: this.props.project.id,
        medias_count: this.props.project.medias_count + 1,
      },
      check_search_project: {
        id: this.props.project.search_id,
        number_of_results: this.props.project.medias_count + 1,
      },
    };
  }

  getVariables() {
    return {
      project_id: this.props.project.dbid,
      project_media_id: this.props.projectMedia.dbid,
    };
  }

  getConfigs() {
    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: {
          check_search_project: this.props.project.search_id,
          project: this.props.project.id,
          project_media: this.props.projectMedia.id,
        },
      },
    ];
  }

  static fragments = {
    project: () => Relay.QL`
      fragment on Project {
        id
        dbid
        search_id
        medias_count
      }
    `,
  };
}

export default CreateProjectMediaProjectMutation;
