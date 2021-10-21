import Relay from 'react-relay/classic';

class UploadFileMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation { searchUpload }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on SearchUploadPayload {
        file_handle
      }
    `;
  }

  getVariables() {
    const vars = {
      input: this.props.input,
    };
    return vars;
  }

  getFiles() {
    const { file } = this.props;
    return { file };
  }

  getConfigs() {
    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: {
          file_handle: this.props.file_handle,
        },
      },
    ];
  }
}

export default UploadFileMutation;
