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
        check_search_team { id, number_of_results }
        check_search_trash { id, number_of_results }
        check_search_spam { id, number_of_results }
        team { id, medias_count, public_team { id, trash_count, spam_count } }
      }
    `;
  }

  getVariables() {
    const params = { archived: this.props.archived };
    const vars = {
      ids: this.props.ids,
      action: 'archived',
    };
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
      team: {
        id: this.props.team.id,
        medias_count: this.props.team.medias_count - this.props.ids.length,
        public_team: {
          id: this.props.team.public_team.id,
        },
      },
    };
    if (this.props.archived === CheckArchivedFlags.TRASHED) {
      response.team.public_team.trash_count = this.props.team.public_team.trash_count + this.props.ids.length;
      response.check_search_trash = {
        id: this.props.team.check_search_trash.id,
        number_of_results: this.props.team.public_team.trash_count + this.props.ids.length,
      };
    } else if (this.props.archived === CheckArchivedFlags.SPAM) {
      response.team.public_team.spam_count = this.props.team.public_team.spam_count + this.props.ids.length;
      response.check_search_spam = {
        id: this.props.team.check_search_spam.id,
        number_of_results: this.props.team.public_team.spam_count + this.props.ids.length,
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
          check_search_spam: this.props.team.check_search_spam.id,
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
    return configs;
  }
}

export default BulkArchiveProjectMediaMutation;
