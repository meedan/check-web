import Relay from 'react-relay/classic';

class DeleteProjectMediaMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation destroyProject {
      destroyProjectMedia
    }`;
  }

  static fragments = {
    project_media: () => Relay.QL`fragment on ProjectMedia { id }`,
  };

  getVariables() {
    return { id: this.props.id };
  }

  getFatQuery() {
    return Relay.QL`fragment on DestroyProjectMediaPayload { deletedId, check_search_team { id } }`;
  }

  getConfigs() {
    return [
      {
        type: 'NODE_DELETE',
        parentName: 'check_search_team',
        parentID: this.props.check_search_team,
        connectionName: 'medias',
        deletedIDFieldName: 'deletedId',
      },
    ];
  }
}

export default DeleteProjectMediaMutation;
