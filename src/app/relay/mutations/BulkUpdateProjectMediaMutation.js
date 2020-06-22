import Relay from 'react-relay/classic';

class BulkUpdateProjectMediaMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateProjectMedia {
      updateProjectMedia
    }`;
  }

  getFatQuery() {
    if (this.props.dstProjectForAdd) {
      return Relay.QL`
        fragment on UpdateProjectMediaPayload {
          affectedIds
          check_search_project { id, number_of_results, medias }
        }
      `;
    }
    return Relay.QL`
      fragment on UpdateProjectMediaPayload {
        affectedIds
        check_search_project_was { id, number_of_results, medias }
        check_search_project { id, number_of_results, medias }
        check_search_team { id, number_of_results }
        project_was { id, medias_count }
      }
    `;
  }

  getVariables() {
    const vars = {
      id: this.props.id,
      ids: this.props.ids,
    };
    if (this.props.dstProject) {
      vars.move_to_project_id = this.props.dstProject.dbid;
    }
    if (this.props.dstProjectForAdd) {
      vars.add_to_project_id = this.props.dstProjectForAdd.dbid;
      vars.no_freeze = true;
    }
    if (this.props.srcProject) {
      vars.previous_project_id = this.props.srcProject.dbid;
    }
    if (this.props.archived !== undefined) {
      vars.archived = this.props.archived;
    }
    if (this.props.srcProjectForRemove) {
      vars.remove_from_project_id = this.props.srcProjectForRemove.dbid;
      vars.no_freeze = true;
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
      response.project_was = {
        id: this.props.srcProject.id,
        medias_count: this.props.count - this.props.ids.length,
      };
    }
    if (this.props.ids && this.props.count && this.props.dstProject) {
      response.check_search_project = {
        id: this.props.dstProject.id,
        number_of_results: parseInt(this.props.dstProject.medias_count, 10) + this.props.ids.length,
      };
      response.project = {
        id: this.props.dstProject.id,
        medias_count: parseInt(this.props.dstProject.medias_count, 10) + this.props.ids.length,
      };
    }
    if (this.props.ids && this.props.count && this.props.dstProjectForAdd) {
      const count = parseInt(this.props.dstProjectForAdd.medias_count, 10);
      response.check_search_project = {
        id: this.props.dstProjectForAdd.id,
        number_of_results: count + this.props.ids.length,
      };
      response.project = {
        id: this.props.dstProjectForAdd.id,
        medias_count: count + this.props.ids.length,
      };
    }
    if (this.props.ids && this.props.count && this.props.teamSearchId && this.props.archived) {
      response.check_search_team = {
        id: this.props.teamSearchId,
        number_of_results: this.props.count - this.props.ids.length,
      };
    }
    if (this.props.ids && this.props.count && this.props.srcProjectForRemove) {
      response.check_search_project_was = {
        id: this.props.srcProjectForRemove.search_id,
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
        project_was: this.props.srcProject.id,
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
    if (this.props.dstProjectForAdd) {
      const fieldIDs = {
        check_search_project: this.props.dstProjectForAdd.search_id,
      };
      configs = [
        {
          type: 'FIELDS_CHANGE',
          fieldIDs,
        },
      ];
    }
    if (this.props.srcProjectForRemove) {
      const fieldIDs = {
        check_search_project_was: this.props.srcProjectForRemove.search_id,
      };
      configs = [
        {
          type: 'RANGE_DELETE',
          parentName: 'check_search_project_was',
          parentID: this.props.srcProjectForRemove.search_id,
          connectionName: 'medias',
          pathToConnection: ['check_search_project_was', 'medias'],
          deletedIDFieldName: 'affectedIds',
        },
        {
          type: 'FIELDS_CHANGE',
          fieldIDs,
        },
      ];
    }
    if (/^\/[^/]+\/all-items/.test(window.location.pathname) && this.props.archived) {
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
