import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import CreateDynamicMutation from '../../relay/CreateDynamicMutation';
import UpdateDynamicMutation from '../../relay/UpdateDynamicMutation';
import MediaStatusCommon from './MediaStatusCommon';
import { defineMessages, injectIntl, intlShape, FormattedMessage } from 'react-intl';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

class MediaStatus extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      submitted: false,
      setStatus: {},
      note: ''
    };
  }

  handleOpen() {
    this.setState({ open: true });
  }

  handleClose() {
    this.setState({ open: false });
  }

  resetState() {
    this.setState({ open: false, submitted: false, setStatus: {} });
  }

  setStatus(context, store, media, status, parentComponent, note) {
    if (!note) {
      note = '';
    }

    if (status === 'error' && parentComponent && !parentComponent.state.open) {
      parentComponent.setState({ setStatus: { context, store, media, status } });
      parentComponent.handleOpen();
      return;
    }
    const onFailure = (transaction) => { context.fail(transaction); };
    const onSuccess = (response) => { context.success('status'); };

    let status_id = null;
    if (media.translation_status !== null) {
      status_id = media.translation_status.id;
    }

    // Update existing status
    if (status_id != null) {
      const vars = {
        annotated: media,
        dynamic: {
          id: status_id,
          fields: {
            translation_status_status: status,
            translation_status_note: note
          }
        }
      };
      Relay.Store.commitUpdate(
        new UpdateDynamicMutation(vars),
        { onSuccess, onFailure },
      );
    }
    
    // Create new status
    else {
      const vars = {
        parent_type: 'project_media',
        annotated: media,
        annotation: {
          annotation_type: 'translation_status',
          annotated_type: 'ProjectMedia',
          annotated_id: media.dbid,
          fields: {
            translation_status_status: status,
            translation_status_note: note
          }
        }
      };
      Relay.Store.commitUpdate(
        new CreateDynamicMutation(vars),
        { onSuccess, onFailure },
      );
    }
  }

  handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey && !this.state.submitted) {
      this.setState({ submitted: true });
      const st = Object.assign({}, this.state.setStatus);
      this.setStatus(st.context, st.store, st.media, st.status, this, e.target.value);
      document.forms['media-status-note-form'].note.value = '';
      this.resetState();
      e.preventDefault();
    }
  }

  render() {
    const actions = [
      <FlatButton
        label={<FormattedMessage id="mediaStatus.cancelMessage" defaultMessage="Cancel" />}
        secondary={true}
        onClick={this.handleClose.bind(this)}
      />
    ];

    return (
      <span>
        <Dialog
          title={null}
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose.bind(this)}
        >
          <p><FormattedMessage id="mediaStatus.messageDescription" defaultMessage="Please add a comment. it will be sent back to the original poster to inform them that their request will be closed." /></p>
          <form name="media-status-note-form">
            <TextField
              className="media-status--note"
              name="note"
              onKeyPress={this.handleKeyPress.bind(this)}
              errorText={<FormattedMessage id="mediaStatus.noteHint" defaultMessage="Press ENTER to submit" />}
              errorStyle={{ color: '#757575' }}
              autoFocus={true}
              fullWidth
              multiLine
            />
          </form>
        </Dialog>
        <MediaStatusCommon {...this.props} parentComponent={this} setStatus={this.setStatus} />
      </span>
    );
  }
}

MediaStatus.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(MediaStatus);
