import Relay from 'react-relay/classic';

class CreateTagMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation createTag {
      createTag
    }`;
  }

  getFatQuery() {
    switch (this.props.parent_type) {
    case 'source':
      return Relay.QL`fragment on CreateTagPayload { tagEdge, source { id } }`;
    case 'project_media':
      return Relay.QL`fragment on CreateTagPayload { tagEdge, project_media { last_status, last_status_obj,log, tags, log_count, project_id } }`;
    default:
      return '';
    }
  }

  getVariables() {
    const tag = this.props.annotation;
    return { tag: tag.tag, annotated_id: `${tag.annotated_id}`, annotated_type: tag.annotated_type };
  }

  getOptimisticResponse() {
    const media = this.props.media || {};
    const tags = media.tags ? media.tags.edges : [];
    tags.push({ node: { id: 'VGFnLzA=\n', tag_text: this.props.annotation.tag } });
    const tag = {
      id: this.props.id,
      updated_at: new Date().toString(),
      annotation_type: 'tag',
      permissions: '{"destroy Annotation":true,"destroy Tag":true}',
      content: JSON.stringify({ tag: this.props.annotation.tag }),
      tag: this.props.annotation.tag,
      tag_text: this.props.annotation.tag,
      annotated_id: this.props.annotation.annotated_id,
      annotator: {
        name: this.props.annotator.name,
        profile_image: this.props.annotator.profile_image,
      },
      medias: {
        edges: [],
      },
      project_media: {
        id: media.id,
        tags: {
          edges: tags,
        },
      },
    };

    return { tagEdge: { node: tag } };
  }

  getConfigs() {
    const fieldIds = {};
    fieldIds[this.props.parent_type] = this.props.annotated.id;

    return [
      {
        type: 'RANGE_ADD',
        parentName: this.props.parent_type,
        parentID: this.props.annotated.id,
        connectionName: 'tags',
        edgeName: 'tagEdge',
        rangeBehaviors: () => 'prepend',
      },
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: fieldIds,
      },
    ];
  }
}

const createTag = (obj, onSuccess, onFailure) => {
  const {
    media, source, annotator, value,
  } = obj;

  const annotated = media || source;
  let parent_type = '';
  let annotated_type = '';

  if (media) {
    parent_type = 'project_media';
    annotated_type = 'ProjectMedia';
  }

  const tagsList = [...new Set(value.split(','))];

  tagsList.forEach((tag) => {
    Relay.Store.commitUpdate(
      new CreateTagMutation({
        annotated,
        annotator,
        parent_type,
        media,
        annotation: {
          tag,
          annotated_type,
          annotated_id: annotated.dbid,
        },
      }),
      { onSuccess, onFailure },
    );
  });
};

export default CreateTagMutation;
export { createTag };
