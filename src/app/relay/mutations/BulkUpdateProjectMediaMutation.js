import Relay from 'react-relay/classic';

class BulkUpdateProjectMediaMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateProjectMedia {
      updateProjectMedia
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on UpdateProjectMediaPayload {
        affectedIds
        check_search_project_was { id, number_of_results }
        check_search_project { id, medias, number_of_results }
        check_search_team { id, number_of_results }
      }
    `;
  }

  getVariables() {
    const vars = {
      id: this.props.id,
      ids: this.props.ids,
    };
    if (this.props.dstProject) {
      vars.project_id = this.props.dstProject.dbid;
    }
    if (this.props.dstProjectForClone) {
      vars.copy_to_project_id = this.props.dstProjectForClone.dbid;
      vars.no_freeze = true;
    }
    if (this.props.srcProject) {
      vars.previous_project_id = this.props.srcProject.dbid;
    }
    if (this.props.archived) {
      vars.archived = 1;
    }
    return vars;
  }

  getOptimisticResponse() {
    const response = {
      affectedIds: this.props.ids,
    };
    if (this.props.ids && this.props.count && this.props.srcProject) {
      response.check_search_project_was = {
        id: this.props.srcProject.search_id,
        number_of_results: this.props.count - this.props.ids.length,
      };
    }
    if (this.props.ids && this.props.count && this.props.teamSearchId && this.props.archived) {
      response.check_search_team = {
        id: this.props.teamSearchId,
        number_of_results: this.props.count - this.props.ids.length,
      };
    }
    return response;
  }

  getConfigs() {
    let configs = [];
    if (this.props.srcProject) {
      const fieldIDs = {
        check_search_project_was: this.props.srcProject.search_id,
      };
      if (this.props.dstProject) {
        fieldIDs.check_search_project = this.props.dstProject.search_id;
      }
      configs = [
        {
          type: 'NODE_DELETE',
          parentName: 'check_search_project_was',
          parentID: this.props.srcProject.search_id,
          connectionName: 'medias',
          deletedIDFieldName: 'affectedIds',
        },
        {
          type: 'FIELDS_CHANGE',
          fieldIDs,
        },
      ];
    }
    if (/^\/[^/]+\/search/.test(window.location.pathname) && this.props.archived) {
      configs.push({
        type: 'FIELDS_CHANGE',
        fieldIDs: {
          check_search_team: this.props.teamSearchId,
        },
      });
      configs.push({
        type: 'NODE_DELETE',
        parentName: 'check_search_team',
        parentID: this.props.teamSearchId,
        connectionName: 'medias',
        deletedIDFieldName: 'affectedIds',
      });
    }
    return configs;
  }
}

export default BulkUpdateProjectMediaMutation;
