import Relay from 'react-relay/classic';

class BulkMoveProjectMediaMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation bulkUpdateProjectMedia {
      updateProjectMedias
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on UpdateProjectMediasPayload {
        ids
        check_search_project { id, number_of_results }
        check_search_team { id, number_of_results }
        project { id, medias_count }
        project_group { id, medias_count }
        project_was { id, medias_count }
        check_search_project_was { id, number_of_results }
      }
    `;
  }

  getVariables() {
    const vars = {
      ids: this.props.ids,
      move_to: this.props.dstProject.dbid,
    };
    if (this.props.srcProject) {
      vars.previous_project_id = this.props.srcProject.dbid;
    }
    return vars;
  }

  getOptimisticResponse() {
    const response = {
      ids: this.props.ids,
      project: {
        id: this.props.dstProject.id,
        medias_count: this.props.dstProject.medias_count + this.props.ids.length,
      },
      check_search_project: {
        id: this.props.dstProject.search_id,
        number_of_results: this.props.dstProject.medias_count + this.props.ids.length,
      },
    };
    if (this.props.srcProject) {
      response.project_was = {
        id: this.props.srcProject.id,
        medias_count: this.props.srcProject.medias_count - this.props.ids.length,
      };
      response.check_search_project = {
        id: this.props.srcProject.search_id,
        number_of_results: this.props.srcProject.medias_count - this.props.ids.length,
      };
    }
    return response;
  }

  getConfigs() {
    const config = [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: {
          project: this.props.dstProject.id,
          check_search_project: this.props.dstProject.search_id,
        },
      },
    ];
    if (this.props.srcProject) {
      config[0].fieldIDs.project_was = this.props.srcProject.id;
      config[0].fieldIDs.check_search_project_was = this.props.srcProject.search_id;
      config.push({
        type: 'NODE_DELETE',
        parentName: 'check_search_project_was',
        parentID: this.props.srcProject.search_id,
        connectionName: 'medias',
        deletedIDFieldName: 'ids',
      });
    }
    return config;
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
        medias_count
      }
    `,
  };
}

export default BulkMoveProjectMediaMutation;
