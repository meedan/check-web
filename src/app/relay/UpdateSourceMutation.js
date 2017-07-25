import Relay from 'react-relay';

class UpdateSourceMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateSource {
      updateSource
    }`;
  }

  getFatQuery() {
    return Relay.QL`fragment on UpdateSourcePayload {
      source {
        name,
        image,
        description,
      }
    }`;
  }

  getVariables() {
    return {
      id: this.props.source.id,
      name: this.props.source.name,
      slogan: this.props.source.description,
    };
  }

  getFiles() {
    return {
      file: this.props.source.image,
    };
  }

  getConfigs() {
    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: {
          source: this.props.source.id,
        },
      },
    ];
  }
}

export default UpdateSourceMutation;
