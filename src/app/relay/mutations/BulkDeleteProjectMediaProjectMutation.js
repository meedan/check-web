import Relay from 'react-relay/classic';

class BulkDeleteProjectMediaProjectMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation destroyProjectMediaProject {
      destroyProjectMediaProject
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on DestroyProjectMediaProjectPayload {
        affectedIds
        check_search_project_was { id, number_of_results, medias }
        check_search_project { id, number_of_results, medias }
        check_search_team { id, number_of_results }
        check_search_trash { id, number_of_results }
        team { id, medias_count, public_team { id, trash_count } }
        project { id, medias_count }
        project_was { id, medias_count }
      }
    `;
  }

  getVariables() {
    return {
      id: this.props.id,
      ids: this.props.ids,
    };
  }

  getOptimisticResponse() {
    const response = {
      affectedIds: this.props.ids,
    };
    response.check_search_project_was = {
      id: this.props.srcProjectForRemove.search_id,
      number_of_results: this.props.count - this.props.ids.length,
    };
    response.project_was = {
      id: this.props.srcProjectForRemove.id,
      medias_count: this.props.count - this.props.ids.length,
    };
    return response;
  }

  getConfigs() {
    let configs = [];
    const fieldIDs = {
      check_search_project_was: this.props.srcProjectForRemove.search_id,
      project_was: this.props.srcProjectForRemove.id,
    };
    configs = [
      {
        type: 'NODE_DELETE',
        parentName: 'check_search_project_was',
        parentID: this.props.srcProjectForRemove.search_id,
        connectionName: 'medias',
        deletedIDFieldName: 'affectedIds',
      },
      {
        type: 'FIELDS_CHANGE',
        fieldIDs,
      },
    ];
    return configs;
  }
}

export default BulkDeleteProjectMediaProjectMutation;
