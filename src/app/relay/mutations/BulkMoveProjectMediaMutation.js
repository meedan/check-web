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
        project_was { id, medias_count }
        check_search_project_was { id, number_of_results }
      }
    `;
  }

  getVariables() {
    const vars = {
      ids: this.props.ids,
      move_to: this.props.dstProject.dbid,
      previous_project_id: this.props.srcProject.dbid,
    };
    return vars;
  }

  getOptimisticResponse() {
    return {
      ids: this.props.ids,
      project_was: {
        id: this.props.srcProject.id,
        medias_count: this.props.srcProject.medias_count - this.props.ids.length,
      },
      check_search_project_was: {
        id: this.props.srcProject.search_id,
        number_of_results: this.props.srcProject.medias_count - this.props.ids.length,
      },
      project: {
        id: this.props.dstProject.id,
        medias_count: this.props.dstProject.medias_count + this.props.ids.length,
      },
      check_search_project: {
        id: this.props.dstProject.search_id,
        number_of_results: this.props.dstProject.medias_count + this.props.ids.length,
      },
    };
  }

  getConfigs() {
    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: {
          project: this.props.dstProject.id,
          check_search_project: this.props.dstProject.search_id,
          project_was: this.props.srcProject.id,
          check_search_project_was: this.props.srcProject.search_id,
        },
      },
      {
        type: 'NODE_DELETE',
        parentName: 'check_search_project_was',
        parentID: this.props.srcProject.search_id,
        connectionName: 'medias',
        deletedIDFieldName: 'ids',
      },
    ];
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
