import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';

class UpdateMediaMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateMedia {
      updateMedia
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on UpdateMediaPayload {
        media
      }
    `;
  }

  getVariables() {
    return {
      id: this.props.id,
      // url: this.props.url
      information: this.props.information,
      // project_id: this.props.project.dbid
    };
  }

  getConfigs() {
    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: { media: this.props.id },
      },
    ];
  }
}

export default UpdateMediaMutation;
