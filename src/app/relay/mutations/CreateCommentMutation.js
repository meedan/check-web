import Relay from 'react-relay/classic';

class CreateCommentMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation createComment {
      createComment
    }`;
  }

  getFatQuery() {
    switch (this.props.parent_type) {
    case 'project_media':
      return Relay.QL`fragment on CreateCommentPayload {
        commentEdge,
        project_media {
          last_status,
          last_status_obj,
          comments
          log,
          log_count
        }
      }`;
    case 'task':
      return Relay.QL`fragment on CreateCommentPayload { commentEdge, versionEdge, task { id, log_count }, project_media { last_status, last_status_obj, id, log, log_count } }`;
    default:
      return '';
    }
  }

  getOptimisticResponse() {
    const { text, annotated_type } = this.props.annotation;
    const annotated_id = this.props.annotated.dbid;
    const annotator_id = this.props.annotator.dbid;
    const { annotator } = this.props;

    const object_after = {
      data: {
        text,
      },
      annotated_id,
      annotated_type,
      annotation_type: 'comment',
      annotator_type: 'User',
      annotator_id,
    };

    const object_changes_json = {
      data: [null, { text }],
      annotated_id: [null, annotated_id],
      annotated_type: [null, annotated_type],
      annotation_type: [null, 'comment'],
      annotator_type: [null, 'User'],
      annotator_id: [null, annotator_id],
    };

    const now = new Date().getTime() / 1000;

    const versionEdge = {
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

    const response = { versionEdge };

    if (annotated_type !== 'ProjectSource') {
      response.project_media = project_media;
    }

    return response;
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
    const { parent_type } = this.props;
    const { annotated } = this.props;

    fieldIds[parent_type] = annotated.id;

    if (parent_type === 'task') {
      fieldIds.project_media = annotated.project_media.id;
    }

    const configs = [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: fieldIds,
      },
      {
        type: 'RANGE_ADD',
        parentName: parent_type,
        parentID: annotated.id,
        connectionName: 'comments',
        edgeName: 'commentEdge',
        rangeBehaviors: () => ('append'),
      },
    ];

    return configs;
  }
}

export default CreateCommentMutation;
