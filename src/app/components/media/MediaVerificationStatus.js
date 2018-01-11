import React, { Component } from 'react';
import Relay from 'react-relay';
import CreateStatusMutation from '../../relay/mutations/CreateStatusMutation';
import UpdateStatusMutation from '../../relay/mutations/UpdateStatusMutation';
import MediaStatusCommon from './MediaStatusCommon';

class MediaStatus extends Component {
  static setStatus(context, store, media, status) {
    const status_id = media.last_status_obj ? media.last_status_obj.id : '';
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

    const onFailure = (transaction) => {
      context.fail(transaction);
    };

    const onSuccess = () => {
      context.success('status');
    };

    // Add or Update status
    if (status_id && status_id.length) {
      Relay.Store.commitUpdate(new UpdateStatusMutation(status_attr), { onSuccess, onFailure });
    } else {
      Relay.Store.commitUpdate(new CreateStatusMutation(status_attr), { onSuccess, onFailure });
    }
  }

  render() {
    return (<MediaStatusCommon
      {...this.props}
      parentComponent={this}
      setStatus={MediaStatus.setStatus}
    />);
  }
}

export default MediaStatus;
