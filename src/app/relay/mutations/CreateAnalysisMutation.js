import Relay from 'react-relay/classic';

class CreateAnalysisMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation {
      createDynamic
    }`;
  }

  getFatQuery() {
    return Relay.QL`fragment on CreateDynamicPayload {
      dynamicEdge
      project_media {
        id
        dynamic_annotation_analysis: annotation(annotation_type: "analysis") {
          id
          dbid
          content
        }
      }
    }`;
  }

  getVariables() {
    const dynamic = this.props.annotation;
    return {
      set_fields: JSON.stringify(dynamic.fields),
      annotation_type: 'analysis',
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

export default CreateAnalysisMutation;
