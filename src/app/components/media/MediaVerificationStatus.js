import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import MediaStatusCommon from './MediaStatusCommon';
import CreateStatusMutation from '../../relay/mutations/CreateStatusMutation';
import UpdateStatusMutation from '../../relay/mutations/UpdateStatusMutation';

class MediaStatus extends Component {
  setStatus(context, store, media, status) {
    if (this.props.onChanging) {
      this.props.onChanging();
    }
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
      if (this.props.callback) {
        this.props.callback();
      } else {
        context.success('status');
      }
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
      setStatus={this.setStatus.bind(this)}
    />);
  }
}

export default MediaStatus;
