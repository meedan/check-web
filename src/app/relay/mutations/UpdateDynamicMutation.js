import Relay from 'react-relay';

class UpdateDynamicMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateDynamic {
      updateDynamic
    }`;
  }

  getFatQuery() {
    switch (this.props.parent_type) {
    case 'source':
      return Relay.QL`fragment on UpdateDynamicPayload {
        dynamicEdge,
        source {
          log,
          id,
          log_count,
          metadata: annotations(annotation_type: "metadata")
        }
      }`;
    case 'project_media':
      return Relay.QL`fragment on UpdateDynamicPayload {
        dynamicEdge,
        project_media {
          tasks,
          log,
          id,
          log_count,
          field_value(annotation_type_field_name: "translation_status:translation_status_status"),
          translation_status: annotation(annotation_type: "translation_status")
        }
      }`;
    default:
      return '';
    }
  }

  getVariables() {
    const dynamic = this.props.dynamic;
    const vars = { id: dynamic.id };
    if (dynamic.fields) {
      vars.set_fields = JSON.stringify(dynamic.fields);
    }
    if (dynamic.set_attribution) {
      vars.set_attribution = dynamic.set_attribution;
    }
    if (Object.prototype.hasOwnProperty.call(dynamic, 'lock_version')) {
      vars.lock_version = dynamic.lock_version;
    }
    return vars;
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

export default UpdateDynamicMutation;
