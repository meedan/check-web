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
      return Relay.QL`fragment on CreateCommentPayload { commentEdge, comment_versionEdge, project_media { last_status, last_status_obj, log_count } }`;
    case 'task':
      return Relay.QL`fragment on CreateCommentPayload { commentEdge, task { id, log, log_count }, project_media { last_status, last_status_obj, id, log, log_count } }`;
    default:
      return '';
    }
  }

  getOptimisticResponse() {
    const comment_versionEdge = {
      node: {
        annotation: {
          annotation_type: 'comment',
          content: '{"text":"bora"}',
          created_at: '1562190302',
          updated_at: '1562190302',
          permissions: '{"read Comment":true,"update Comment":true,"destroy Comment":true}',
          medias: {
            edges: [],
          },
          annotator: {
            name: 'Alexandre',
            profile_image: 'https://pbs.twimg.com/profile_images/951114838775881728/qaRuGC5J_normal.jpg',
          },
          version: null,
        },
        created_at: '1561659613',
        dbid: 0,
        event: 'create',
        event_type: 'create_dynamic',
        item_id: '0',
        item_type: 'Dynamic',
        object_after: '{"annotation_type":"metadata","annotated_type":"ProjectMedia","annotated_id":77,"annotator_type":"User","annotator_id":4}',
        object_changes_json: '{"annotation_type":[null,"metadata"],"annotated_type":[null,"ProjectMedia"],"annotated_id":[null,77],"annotator_type":[null,"User"],"annotator_id":[null,4]}',
        user: {
          name: 'Alexandre',
          is_active: true,
          source: {
            image: 'https://pbs.twimg.com/profile_images/951114838775881728/qaRuGC5J_normal.jpg',
          },
        },
      },
    };

    const project_media = {
      id: this.props.annotated.id,
      log_count: this.props.annotated.log_count + 1,
    };

    return { project_media, comment_versionEdge };
  }

  getVariables() {
    const comment = this.props.annotation;
    return { text: comment.text, annotated_id: `${comment.annotated_id}`, annotated_type: comment.annotated_type };
  }

  getFiles() {
    return { file: this.props.image };
  }

  getConfigs() {
    console.log('this.props', this.props);

    const fieldIds = {};
    fieldIds[this.props.parent_type] = this.props.annotated.id;

    if (this.props.parent_type === 'task') {
      fieldIds.project_media = this.props.annotated.project_media.id;
    }

    const configs = [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: fieldIds,
      },
      {
        type: 'RANGE_ADD',
        parentName: 'project_media',
        parentID: this.props.annotated_id,
        connectionName: 'log',
        edgeName: 'comment_versionEdge',
        rangeBehaviors: {
          '': 'prepend',
        },
      },
    ];

    return configs;
  }
}

export default CreateCommentMutation;
