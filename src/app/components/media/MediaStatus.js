import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import CreateStatusMutation from '../../relay/CreateStatusMutation';
import UpdateStatusMutation from '../../relay/UpdateStatusMutation';
import MediaStatusCommon from './MediaStatusCommon';

class MediaStatus extends Component {
  setStatus(context, store, media, status, parent, attrs) {
    const onFailure = (transaction) => { context.fail(transaction); };
    const onSuccess = (response) => { context.success('status'); };

    let status_id = '';
    if (media.last_status_obj !== null) {
      status_id = media.last_status_obj.id;
    }
    const status_attr = {
      parent_type: 'project_media',
      annotated: media,
      annotator: store.currentUser,
      context: store,
      annotation: {
        status,
        annotated_type: 'ProjectMedia',
        annotated_id: media.dbid,
        status_id,
      },
    };

    // Add or Update status
    if (status_id && status_id.length) {
      Relay.Store.commitUpdate(
        new UpdateStatusMutation(status_attr),
        { onSuccess, onFailure },
      );
    } else {
      Relay.Store.commitUpdate(
        new CreateStatusMutation(status_attr),
        { onSuccess, onFailure },
      );
    }
  }

  render() {
    return (<MediaStatusCommon {...this.props} parentComponent={this} setStatus={this.setStatus} />);
  }
}

export default MediaStatus;
