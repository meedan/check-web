import Relay from 'react-relay/classic';
import CheckArchivedFlags from '../../CheckArchivedFlags';

class BulkArchiveProjectMediaMutation extends Relay.Mutation {
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
        check_search_trash { id, number_of_results }
        team { id, medias_count, public_team { id, trash_count } }
        project { id, medias_count }
      }
    `;
  }

  getVariables() {
    const params = { archived: CheckArchivedFlags.TRASHED };
    const vars = {
      ids: this.props.ids,
      action: 'archived',
    };
    if (this.props.project) {
      params.previous_project_id = this.props.project.dbid;
    }
    vars.params = JSON.stringify(params);
    return vars;
  }

  getOptimisticResponse() {
    const response = {
      ids: this.props.ids,
      check_search_team: {
        id: this.props.team.search_id,
        number_of_results: this.props.team.medias_count - this.props.ids.length,
      },
      check_search_trash: {
        id: this.props.team.check_search_trash.id,
        number_of_results: this.props.team.public_team.trash_count + this.props.ids.length,
      },
      team: {
        id: this.props.team.id,
        medias_count: this.props.team.medias_count - this.props.ids.length,
        public_team: {
          id: this.props.team.public_team.id,
          trash_count: this.props.team.public_team.trash_count + this.props.ids.length,
        },
      },
    };
    if (this.props.project) {
      response.project = {
        id: this.props.project.id,
        medias_count: this.props.project.medias_count - this.props.ids.length,
      };
      response.check_search_project = {
        id: this.props.project.search_id,
        number_of_results: this.props.project.medias_count - this.props.ids.length,
      };
    }
    return response;
  }

  getConfigs() {
    const configs = [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: {
          check_search_team: this.props.team.search_id,
          check_search_trash: this.props.team.check_search_trash.id,
          team: this.props.team.id,
        },
      },
      {
        type: 'NODE_DELETE',
        parentName: 'check_search_team',
        parentID: this.props.team.search_id,
        connectionName: 'medias',
        deletedIDFieldName: 'ids',
      },
    ];
    if (this.props.project) {
      configs[0].fieldIDs.check_search_project = this.props.project.search_id;
      configs[0].fieldIDs.project = this.props.project.id;
      configs.push({
        type: 'NODE_DELETE',
        parentName: 'check_search_project',
        parentID: this.props.project.search_id,
        connectionName: 'medias',
        deletedIDFieldName: 'ids',
      });
    }
    return configs;
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

export default BulkArchiveProjectMediaMutation;
