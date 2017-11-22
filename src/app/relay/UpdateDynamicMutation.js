import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';

class UpdateDynamicMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateDynamic {
      updateDynamic
    }`;
  }

  getFatQuery() {
    let query = '';
    switch (this.props.parent_type) {
    case 'source':
      query = Relay.QL`fragment on UpdateDynamicPayload {
        dynamicEdge,
        source {
          log,
          id,
          log_count,
          metadata: annotations(annotation_type: "metadata")
        }
      }`;
      break;
    case 'project_media':
      query = Relay.QL`fragment on UpdateDynamicPayload {
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
      break;
    }
    return query;
  }

  getVariables() {
    const dynamic = this.props.dynamic;
    let vars = { id: dynamic.id };
    if (dynamic.fields) {
      vars.set_fields = JSON.stringify(dynamic.fields);
    }
    if (dynamic.set_attribution) {
      vars.set_attribution = dynamic.set_attribution;
    }
    if (dynamic.hasOwnProperty('lock_version')) {
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
