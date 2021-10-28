import Relay from 'react-relay/classic';

class UpdateCommentMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateComment {
      updateComment
    }`;
  }

  getFatQuery() {
    return Relay.QL`fragment on UpdateCommentPayload {
      commentEdge,
      project_media {
        id,
        comments,
        log_count
      }
    }`;
  }

  getFiles() {
    if (this.props.file) {
      return { file: this.props.file };
    }
    return {};
  }

  getVariables() {
    return {
      id: this.props.annotation.id,
      text: this.props.text,
    };
  }

  getConfigs() {
    const fieldIds = { project_media: this.props.annotated.id };
    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: fieldIds,
      },
    ];
  }
}

export default UpdateCommentMutation;
