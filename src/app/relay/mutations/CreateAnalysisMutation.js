import Relay from 'react-relay/classic';

class CreateAnalysisMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation {
      createDynamicAnnotationAnalysis
    }`;
  }

  getFatQuery() {
    return Relay.QL`fragment on CreateDynamicAnnotationAnalysisPayload {
      dynamicEdge,
      project_media {
        id
        dynamic_annotation_analysis {
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

export default CreateAnalysisMutation;
