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
      deletedId: this.props.project_media.id,
      project: {
        id: this.props.project.id,
        medias_count: this.props.project.medias_count - 1,
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
      {
        type: 'NODE_DELETE',
        parentName: 'check_search_project',
        parentID: this.props.project.search_id,
        connectionName: 'medias',
        deletedIDFieldName: 'deletedId',
      },
    ];
  }
}

export default DeleteProjectMediaProjectMutation;
