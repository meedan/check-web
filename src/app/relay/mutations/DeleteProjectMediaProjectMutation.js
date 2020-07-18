import Relay from 'react-relay/classic';

class DeleteProjectMediaProjectMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation destroyProjectMediaProject {
      destroyProjectMediaProject
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on DestroyProjectMediaProjectPayload {
        project { id, medias_count, dbid, title, team { slug } }
        check_search_project { id, number_of_results }
        project_media { id, project_ids }
      }
    `;
  }

  getOptimisticResponse() {
    return {
      project: {
        id: this.props.project.id,
        medias_count: this.props.project.medias_count - 1,
      },
      check_search_project: {
        id: this.props.project.search_id,
        number_of_results: this.props.project.medias_count - 1,
      },
    };
  }

  getVariables() {
    return { id: this.props.id };
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
}

export default DeleteProjectMediaProjectMutation;
