import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';

class UpdateDynamicMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateDynamic {
      updateDynamic
    }`;
  }

  getFatQuery() {
    return Relay.QL`fragment on UpdateDynamicPayload { dynamicEdge, project_media { tasks, log, id, annotations_count, field_value(annotation_type_field_name: "translation_status:translation_status_status"), dynamic_annotation(annotation_type: "translation_status") } }`;
  }

  getVariables() {
    const dynamic = this.props.dynamic;
    return { set_fields: JSON.stringify(dynamic.fields), id: dynamic.id };
  }

  getConfigs() {
    const fieldIds = {};
    fieldIds.project_media = this.props.annotated.id;

    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: fieldIds,
      },
    ];
  }
}

export default UpdateDynamicMutation;
