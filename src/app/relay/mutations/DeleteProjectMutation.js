import Relay from 'react-relay/classic';

class DeleteProjectMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation destroyProject {
      destroyProject
    }`;
  }

  static fragments = {
    project: () => Relay.QL`fragment on Project { id }`,
  };

  getVariables() {
    return { id: this.props.project.id };
  }

  getFatQuery() {
    return Relay.QL`fragment on DestroyProjectPayload { deletedId, team { id }, check_search_team { id, medias } }`;
  }

  getOptimisticResponse() {
    return {
      deletedId: this.props.project.id,
      team: {
        id: this.props.team.id,
      },
    };
  }

  getConfigs() {
    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: {
          check_search_team: this.props.team.search_id,
        },
      },
      {
        type: 'RANGE_DELETE',
        parentName: 'team',
        parentID: this.props.team.id,
        connectionName: 'projects',
        pathToConnection: ['team', 'projects'],
        deletedIDFieldName: 'deletedId',
      },
    ];
  }
}

export default DeleteProjectMutation;
