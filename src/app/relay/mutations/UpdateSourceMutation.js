import Relay from 'react-relay';

const refreshSource = (id, onFailure) => {
  Relay.Store.commitUpdate(
    new UpdateSourceMutation({
      source: {
        refresh_accounts: 1,
        id,
      },
    }),
    { onFailure },
  );
};

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
        lock_version,
      }
    }`;
  }

  getVariables() {
    const vars = {
      id: this.props.source.id,
      name: this.props.source.name,
      slogan: this.props.source.description,
      lock_version: this.props.source.lock_version,
    };
    if (this.props.source.refresh_accounts) {
      vars.refresh_accounts = 1;
    }
    return vars;
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
export { refreshSource };
