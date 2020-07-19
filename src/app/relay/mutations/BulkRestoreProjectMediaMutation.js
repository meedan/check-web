import Relay from 'react-relay/classic';

class BulkRestoreProjectMediaMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation bulkUpdateProjectMedia {
      updateProjectMedias
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on UpdateProjectMediasPayload {
        ids
        check_search_team { id, number_of_results }
        check_search_trash { id, number_of_results }
        team { id, medias_count, public_team { id, trash_count } }
      }
    `;
  }

  getVariables() {
    return {
      ids: this.props.ids,
      archived: false,
    };
  }

  getOptimisticResponse() {
    return {
      ids: this.props.ids,
      check_search_team: {
        id: this.props.team.search_id,
        number_of_results: this.props.team.medias_count + this.props.ids.length,
      },
      check_search_trash: {
        id: this.props.team.check_search_trash.id,
        number_of_results: this.props.team.public_team.trash_count - this.props.ids.length,
      },
      team: {
        id: this.props.team.id,
        medias_count: this.props.team.medias_count + this.props.ids.length,
        public_team: {
          id: this.props.team.public_team.id,
          trash_count: this.props.team.public_team.trash_count - this.props.ids.length,
        },
      },
    };
  }

  getConfigs() {
    return [
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
        parentName: 'check_search_trash',
        parentID: this.props.team.check_search_trash.id,
        connectionName: 'medias',
        deletedIDFieldName: 'ids',
      },
    ];
  }
}

export default BulkRestoreProjectMediaMutation;
