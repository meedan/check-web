import Relay from 'react-relay/classic';

class CreateReportDesignMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation {
      createDynamicAnnotationReportDesign
    }`;
  }

  getFatQuery() {
    return Relay.QL`fragment on CreateDynamicAnnotationReportDesignPayload {
      dynamicEdge,
      project_media {
        annotations(first: 1, annotation_type: "report_design")
        dynamic_annotation_report_design
      }
    }`;
  }

  getFiles() {
    if (this.props.image) {
      return { 'file[]': this.props.image };
    }
    if (this.props.images) {
      const files = {};
      Object.keys(this.props.images).forEach((key) => {
        files[`file[${key}]`] = this.props.images[key];
      });
      return files;
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

export default CreateReportDesignMutation;
