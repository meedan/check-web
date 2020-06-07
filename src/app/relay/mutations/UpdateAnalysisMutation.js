import Relay from 'react-relay/classic';

class UpdateAnalysisMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation {
      updateDynamicAnnotationAnalysis
    }`;
  }

  getFatQuery() {
    return Relay.QL`fragment on UpdateDynamicAnnotationAnalysisPayload {
      dynamicEdge,
      project_media {
        id
        dynamic_annotation_analysis: annotation(annotation_type: "analysis")  {
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
      id: dynamic.id,
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

export default UpdateAnalysisMutation;
