import Relay from 'react-relay/classic';

class CreateSourceMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation createSource {
      createSource
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on CreateSourcePayload {
        sourceEdge
      }
    `;
  }


  getVariables() {
    return {
      name: this.props.name,
      slogan: this.props.slogan,
      add_to_project_media_id: this.props.mediaId,
    };
  }

  getFiles() {
    return {
      file: this.props.image,
    };
  }

  getConfigs() {
    return [];
  }
}

export default CreateSourceMutation;
