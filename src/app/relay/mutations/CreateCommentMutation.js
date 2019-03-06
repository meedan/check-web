import Relay from 'react-relay/classic';

class CreateCommentMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation createComment {
      createComment
    }`;
  }

  getFatQuery() {
    switch (this.props.parent_type) {
    case 'project_source':
      return Relay.QL`fragment on CreateCommentPayload { commentEdge, project_source { source { log, log_count } } }`;
    case 'project_media':
      return Relay.QL`fragment on CreateCommentPayload { commentEdge, project_media { last_status, last_status_obj, log, log_count } }`;
    case 'task':
      return Relay.QL`fragment on CreateCommentPayload { commentEdge, task { id, log, log_count }, project_media { last_status, last_status_obj, id, log, log_count } }`;
    default:
      return '';
    }
  }

  getOptimisticResponse() {
    const comment = {
      id: this.props.id,
      updated_at: new Date().toString(),
      annotation_type: 'comment',
      permissions: '{"destroy Annotation":true,"destroy Comment":true}',
      content: JSON.stringify({ text: this.props.annotation.text }),
      annotated_id: this.props.annotation.annotated_id,
      annotator: {
        name: this.props.annotator.name,
        profile_image: this.props.annotator.profile_image,
      },
      medias: {
        edges: [],
      },
    };

    return { commentEdge: { node: comment } };
  }

  getVariables() {
    const comment = this.props.annotation;
    return { text: comment.text, annotated_id: `${comment.annotated_id}`, annotated_type: comment.annotated_type };
  }

  getFiles() {
    return { file: this.props.image };
  }

  getConfigs() {
    const fieldIds = {};
    fieldIds[this.props.parent_type] = this.props.annotated.id;

    if (this.props.parent_type === 'task') {
      fieldIds.project_media = this.props.annotated.project_media.id;
    }

    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: fieldIds,
      },
    ];
  }
}

export default CreateCommentMutation;
