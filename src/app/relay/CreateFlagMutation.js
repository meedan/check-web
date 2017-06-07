import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';

class CreateFlagMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation createFlag {
      createFlag
    }`;
  }

  getFatQuery() {
    let query = '';
    switch (this.props.parent_type) {
    case 'source':
      query = Relay.QL`fragment on CreateFlagPayload { flagEdge, source { annotations } }`;
      break;
    case 'project_media':
      query = Relay.QL`fragment on CreateFlagPayload { flagEdge, project_media { log, log_count } }`;
      break;
    }
    return query;
  }

  getOptimisticResponse() {
    const flag = {
      id: this.props.id,
      updated_at: new Date().toString(),
      annotation_type: 'flag',
      permissions: '{"destroy Annotation":true,"destroy Flag":true}',
      content: JSON.stringify({ flag: this.props.annotation.flag }),
      annotated_id: this.props.annotation.annotated_id,
      annotator: {
        name: this.props.annotator.name,
        profile_image: this.props.annotator.profile_image,
      },
      medias: {
        edges: [],
      },
    };

    return { flagEdge: { node: flag } };
  }

  getVariables() {
    const flag = this.props.annotation;
    return { flag: flag.flag, annotated_id: `${flag.annotated_id}`, annotated_type: flag.annotated_type };
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

export default CreateFlagMutation;
