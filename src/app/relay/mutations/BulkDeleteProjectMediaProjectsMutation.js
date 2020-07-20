import Relay from 'react-relay/classic';

class BulkDeleteProjectMediaProjectsMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation destroyProjectMediaProjects {
      destroyProjectMediaProjects
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on DestroyProjectMediaProjectsPayload {
        ids
        project_was { id, medias_count }
        check_search_project_was { id, number_of_results }
      }
    `;
  }

  getVariables() {
    return {
      ids: this.props.ids,
      previous_project_id: this.props.project.dbid,
    };
  }

  getOptimisticResponse() {
    return {
      ids: this.props.projectMediaIds,
      project_was: {
        id: this.props.project.id,
        medias_count: this.props.project.medias_count - this.props.ids.length,
      },
      check_search_project_was: {
        id: this.props.project.search_id,
        number_of_results: this.props.project.medias_count - this.props.ids.length,
      },
    };
  }

  getConfigs() {
    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: {
          project_was: this.props.project.id,
          check_search_project_was: this.props.project.search_id,
        },
      },
      {
        type: 'NODE_DELETE',
        parentName: 'check_search_project_was',
        parentID: this.props.project.search_id,
        connectionName: 'medias',
        deletedIDFieldName: 'ids',
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

export default BulkDeleteProjectMediaProjectsMutation;
