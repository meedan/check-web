import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import { injectIntl, FormattedMessage } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import TextField from 'material-ui/TextField';
import CreateDynamicMutation from '../../relay/mutations/CreateDynamicMutation';
import UpdateDynamicMutation from '../../relay/mutations/UpdateDynamicMutation';
import MediaStatusCommon from './MediaStatusCommon';

class MediaStatus extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      submitted: false,
      setStatus: {},
    };
  }

  static setStatus(context, store, media, status, parentComponent, note_) {
    const note = note_ || '';

    if (status === 'error' && parentComponent && !parentComponent.state.open) {
      parentComponent.setState({
        setStatus: {
          context, store, media, status,
        },
      });
      parentComponent.handleOpen();
      return;
    }

    const onFailure = (transaction) => {
      context.fail(transaction);
    };

    const onSuccess = () => {
      context.success('status');
    };

    let status_id = null;

    if (media.translation_status !== null) {
      status_id = media.translation_status.id;
    }

    // Update existing status
    if (status_id != null) {
      const vars = {
        annotated: media,
        parent_type: 'project_media',
        dynamic: {
          id: status_id,
          fields: {
            translation_status_status: status,
            translation_status_note: note,
          },
        },
      };
      Relay.Store.commitUpdate(new UpdateDynamicMutation(vars), { onSuccess, onFailure });
    } else {
      // Create new status
      const vars = {
        parent_type: 'project_media',
        annotated: media,
        annotation: {
          annotation_type: 'translation_status',
          annotated_type: 'ProjectMedia',
          annotated_id: media.dbid,
          fields: {
            translation_status_status: status,
            translation_status_note: note,
          },
        },
      };
      Relay.Store.commitUpdate(new CreateDynamicMutation(vars), { onSuccess, onFailure });
    }
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

  handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey && !this.state.submitted) {
      this.setState({ submitted: true });
      const st = Object.assign({}, this.state.setStatus);
      MediaStatus.setStatus(st.context, st.store, st.media, st.status, this, e.target.value);
      document.forms['media-status-note-form'].note.value = '';
      this.resetState();
      e.preventDefault();
    }
  }

  render() {
    const actions = [
      <Button
        color="secondary"
        onClick={this.handleClose.bind(this)}
      >
        <FormattedMessage id="mediaStatus.cancelMessage" defaultMessage="Cancel" />
      </Button>,
    ];

    return (
      <span>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose.bind(this)}
        >
          <DialogContent>
            <FormattedMessage
              id="mediaStatus.messageDescription"
              defaultMessage="Please add a comment. it will be sent back to the original poster to inform them that their request will be closed."
            />
            <form name="media-status-note-form">
              <TextField
                className="media-status--note"
                name="note"
                onKeyPress={this.handleKeyPress.bind(this)}
                errorText={
                  <FormattedMessage
                    id="mediaStatus.noteHint"
                    defaultMessage="Press ENTER to submit"
                  />
                }
                errorStyle={{ color: '#757575' }}
                autoFocus
                fullWidth
                multiLine
              />
            </form>
          </DialogContent>
          <DialogActions>
            {actions}
          </DialogActions>
        </Dialog>
        <MediaStatusCommon
          {...this.props}
          parentComponent={this}
          setStatus={MediaStatus.setStatus}
        />
      </span>
    );
  }
}

export default injectIntl(MediaStatus);
