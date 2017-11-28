import Relay from 'react-relay';

class CreateTagMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation createTag {
      createTag
    }`;
  }

  getFatQuery() {
    switch (this.props.parent_type) {
    case 'source':
      return Relay.QL`fragment on CreateTagPayload {
        tagEdge,
        source { log, tags, log_count }
      }`;
    case 'project_media':
      return Relay.QL`fragment on CreateTagPayload {
        tagEdge,
        project_media { log, tags, log_count }
      }`;
    case 'project_source':
      return Relay.QL`fragment on CreateTagPayload {
        tagEdge,
        project_source { source { log, tags, log_count } }
      }`;
    default:
      return '';
    }
  }

  getVariables() {
    const tag = this.props.annotation;
    return { tag: tag.tag, annotated_id: `${tag.annotated_id}`, annotated_type: tag.annotated_type };
  }

  getOptimisticResponse() {
    const tag = {
      id: this.props.id,
      updated_at: new Date().toString(),
      annotation_type: 'tag',
      permissions: '{"destroy Annotation":true,"destroy Tag":true}',
      content: JSON.stringify({ tag: this.props.annotation.tag }),
      tag: this.props.annotation.tag,
      annotated_id: this.props.annotation.annotated_id,
      annotator: {
        name: this.props.annotator.name,
        profile_image: this.props.annotator.profile_image,
      },
      medias: {
        edges: [],
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

export default CreateTagMutation;
