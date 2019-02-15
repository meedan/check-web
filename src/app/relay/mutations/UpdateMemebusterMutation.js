import Relay from 'react-relay/classic';

class UpdateMemebusterMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation {
      updateDynamicAnnotationMemebuster
    }`;
  }

  getFatQuery() {
    return Relay.QL`fragment on UpdateDynamicAnnotationMemebusterPayload {
      dynamicEdge,
      project_media {
        annotations(first: 1, annotation_type: "memebuster")
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
      id: this.props.id,
      set_fields: JSON.stringify(dynamic.fields),
      annotation_type: dynamic.annotation_type,
      annotated_id: `${dynamic.annotated_id}`,
      annotated_type: dynamic.annotated_type,
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

export default UpdateMemebusterMutation;
