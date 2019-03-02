import Relay from 'react-relay/classic';

class BulkDeleteProjectMediaMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation destroyProjectMedia {
      destroyProjectMedia
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on DestroyProjectMediaPayload {
        affectedIds
        check_search_team { id, number_of_results }
        check_search_project { id, number_of_results }
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
    return response;
  }

  getConfigs() {
    const ids = { check_search_team: this.props.teamSearchId };
    if (this.props.project) {
      ids.check_search_project = this.props.project.search_id;
    }
    const configs = [
      {
        type: 'NODE_DELETE',
        parentName: 'check_search_team',
        parentID: this.props.teamSearchId,
        connectionName: 'medias',
        deletedIDFieldName: 'affectedIds',
      },
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: ids,
      },
    ];
    return configs;
  }
}

export default BulkDeleteProjectMediaMutation;
