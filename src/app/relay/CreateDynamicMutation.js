import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';

class CreateDynamicMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation createDynamic {
      createDynamic
    }`;
  }

  getFatQuery() {
    let query = '';
    switch (this.props.parent_type) {
    case 'source':
      query = Relay.QL`fragment on CreateDynamicPayload { dynamicEdge, source { annotations } }`;
      break;
    case 'project_media':
      query = Relay.QL`fragment on CreateDynamicPayload { dynamicEdge, project_media { annotations, annotations_count } }`;
      break;
    }
    return query;
  }

  getVariables() {
    const dynamic = this.props.annotation;
    return { set_fields: JSON.stringify(dynamic.fields), annotation_type: dynamic.annotation_type, annotated_id: `${dynamic.annotated_id}`, annotated_type: dynamic.annotated_type };
  }

  getConfigs() {
    const fieldIds = {};
    fieldIds[this.props.parent_type] = this.props.annotated.id;

    return [
      {
        type: 'RANGE_ADD',
        parentName: this.props.parent_type,
        parentID: this.props.annotated.id,
        connectionName: 'annotations',
        edgeName: 'dynamicEdge',
        rangeBehaviors: calls => 'prepend',
      },
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: fieldIds,
      },
    ];
  }
}

export default CreateDynamicMutation;
