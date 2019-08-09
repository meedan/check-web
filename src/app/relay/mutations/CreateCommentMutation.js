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
    const { text } = this.props.annotation;
    const annotated_id = this.props.annotated.dbid;
    const annotator_id = this.props.annotator.dbid;
    const { annotator } = this.props;

    const object_after = {
      data: {
        text,
      },
      annotated_id,
      annotated_type: 'ProjectMedia',
      annotation_type: 'comment',
      annotator_type: 'User',
      annotator_id,
    };

    const object_changes_json = {
      data: [null, { text }],
      annotated_id: [null, annotated_id],
      annotated_type: [null, 'ProjectMedia'],
      annotation_type: [null, 'comment'],
      annotator_type: [null, 'User'],
      annotator_id: [null, annotator_id],
    };

    const now = new Date().getTime() / 1000;

    const comment_versionEdge = {
      node: {
        id: 'VmVyc2lvbi8w',
        dbid: 0,
        item_type: 'Comment',
        item_id: '0',
        event: 'create',
        event_type: 'create_comment',
        created_at: now,
        object_after: JSON.stringify(object_after),
        object_changes_json: JSON.stringify(object_changes_json),
        meta: null,
        user: {
          id: 'VXNlci8w',
          dbid: annotator.dbid,
          name: annotator.name,
          is_active: true,
          source: {
            id: 'U291cmNlLzA=',
            dbid: annotator.source_id,
            image: annotator.profile_image,
          },
        },
        annotation: {
          id: 'QW5ub3RhdGlvbi8w',
          dbid: 0,
          content: JSON.stringify({ text }),
          annotation_type: 'comment',
          updated_at: now,
          created_at: now,
          medias: {
            edges: [],
          },
          permissions: '{"read Comment":true,"update Comment":false,"destroy Comment":false}',
          annotator: {
            name: annotator.name,
            profile_image: annotator.profile_image,
            id: 'QW5ub3RhdG9yLzA=',
          },
          version: null,
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
        parentID: this.props.annotated.id,
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
