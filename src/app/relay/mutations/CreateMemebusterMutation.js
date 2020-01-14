import Relay from 'react-relay/classic';

class CreateMemebusterMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation {
      createDynamicAnnotationMemebuster
    }`;
  }

  getFatQuery() {
    return Relay.QL`fragment on CreateDynamicAnnotationMemebusterPayload {
      dynamicEdge,
      project_media {
        annotations(first: 1, annotation_type: "memebuster")
        dynamic_annotation_memebuster
      }
    }`;
  }

  getFiles() {
    if (this.props.image) {
      return { 'file[]': this.props.image };
    }
    return {};
  }

  getVariables() {
    const dynamic = this.props.annotation;
    return {
      set_fields: JSON.stringify(dynamic.fields), annotation_type: dynamic.annotation_type, annotated_id: `${dynamic.annotated_id}`, annotated_type: dynamic.annotated_type, action: dynamic.action,
    };
  }

  getConfigs() {
    const fieldIds = {};
    fieldIds[this.props.parent_type] = this.props.annotated.id;

    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: fieldIds,
      },
    ];
  }
}

export default CreateMemebusterMutation;
