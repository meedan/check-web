import Relay from 'react-relay/classic';

class BulkUpdateProjectMediaProjectMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateProjectMediaProject {
      updateProjectMediaProject
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on UpdateProjectMediaProjectPayload {
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
    const vars = {
      id: this.props.id,
      ids: this.props.ids,
    };
    if (this.props.dstProject) {
      vars.project_id = this.props.dstProject.dbid;
    }
    if (this.props.srcProject) {
      vars.previous_project_id = this.props.srcProject.dbid;
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
        fieldIDs.project = this.props.dstProject.id;
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
    } else if (this.props.dstProject) {
      const fieldIDs = {
        check_search_project: this.props.dstProject.search_id,
        project: this.props.dstProject.id,
      };
      configs = [
        {
          type: 'FIELDS_CHANGE',
          fieldIDs,
        },
      ];
    }
    return configs;
  }

  static fragments = {
    dstProject: () => Relay.QL`
      fragment on Project {
        id
        dbid
        search_id
        medias_count
      }
    `,
    srcProject: () => Relay.QL`
      fragment on Project {
        id
        dbid
        search_id
      }
    `,
  };
}

export default BulkUpdateProjectMediaProjectMutation;
