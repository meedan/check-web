import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';

class DeleteDynamicMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation destroyDynamic {
      destroyDynamic
    }`;
  }

  static fragments = {
     annotation: () => Relay.QL`fragment on Annotation { id }`,
  };

  getVariables() {
    return { id: this.props.id };
  }

  getFatQuery() {
    let query = '';
    switch (this.props.parent_type) {
    case 'project_source':
      query = Relay.QL`fragment on DestroyDynamicPayload { deletedId, project_source { translations: annotations(annotation_type: "translation", first: 10000) } }`;
      break;
    }
    return query;
  }

  getConfigs() {
    const fieldIds = {};
    fieldIds[this.props.parent_type] = this.props.annotated.id;

    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: fieldIds,
      },
      {
        type: 'NODE_DELETE',
        parentName: this.props.parent_type,
        parentID: this.props.annotated.id,
        connectionName: 'annotations',
        deletedIDFieldName: 'deletedId',
      },
    ];
  }
}

export default DeleteDynamicMutation;
