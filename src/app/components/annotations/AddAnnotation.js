import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import styled from 'styled-components';
import CreateCommentMutation from '../../relay/mutations/CreateCommentMutation';
import UpdateCommentMutation from '../../relay/mutations/UpdateCommentMutation';
import CreateTagMutation from '../../relay/mutations/CreateTagMutation';
import CreateStatusMutation from '../../relay/mutations/CreateStatusMutation';
import UpdateStatusMutation from '../../relay/mutations/UpdateStatusMutation';
import CreateDynamicMutation from '../../relay/mutations/CreateDynamicMutation';
import { can } from '../Can';
import CheckContext from '../../CheckContext';
import UploadFile from '../UploadFile';
import { Row, black38, black87, units } from '../../styles/js/shared';
import { getErrorMessage } from '../../helpers';
import { stringHelper } from '../../customHelpers';
import globalStrings from '../../globalStrings';
import CheckArchivedFlags from '../../CheckArchivedFlags';

class AddAnnotation extends Component {
  static parseCommand(input) {
    const matches = input.match(/^\/([a-z_]+) (.*)/);
    let command = { type: 'unk', args: null };
    if (matches !== null) {
      ([, command.type, command.args] = matches);
    } else if (/^[^/]/.test(input) || !input) {
      command = { type: 'comment', args: input };
    }
    return command;
  }

  constructor(props) {
    super(props);

    this.state = {
      cmd: props.cmdText,
      image: null,
      message: null,
      isSubmitting: false,
      fileMode: false,
      canBeAutoChanged: true,
      canSubmit: false,
    };
  }

  componentDidMount() {
    // This code only applies if this page is embedded in the browser extension
    if (window.parent !== window && this.props.annotatedType === 'Task') {
      // Receive the selected text from the page and use it to fill a task note
      const task = this.props.annotated;
      const receiveMessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.selectedText &&
          this.state.canBeAutoChanged &&
          (this.props.taskResponse || task.type !== 'free_text') &&
          parseInt(data.task, 10) === parseInt(this.props.annotated.dbid, 10)) {
          this.setState({ cmd: data.selectedText });
        }
      };
      window.addEventListener('message', receiveMessage, false);
    }
  }

  onImageChange = (file) => {
    this.setState({ image: file, message: null });
  }

  onImageError(file, message) {
    this.setState({ image: null, message });
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  invalidCommand() {
    this.setState({
      message: (
        <FormattedMessage id="addAnnotation.invalidCommand" defaultMessage="Invalid command" />
      ),
      isSubmitting: false,
    });
  }

  resetState = () => {
    this.setState({
      cmd: '',
      image: null,
      message: null,
      isSubmitting: false,
      fileMode: false,
      canSubmit: false,
    });
  };

  fail = (transaction) => {
    const fallbackMessage = (
      <FormattedMessage
        id="addAnnotation.error"
        defaultMessage="Sorry, an error occurred while updating the item. Please try again and contact {supportEmail} if the condition persists."
        values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
      />
    );
    const message = getErrorMessage(transaction, fallbackMessage);
    this.setState({
      message: message.replace(/<br\s*\/?>/gm, '; '),
      isSubmitting: false,
    });
  };

  addComment(
    annotated,
    annotated_id,
    annotated_type,
    comment,
  ) {
    const { currentUser: annotator } = this.getContext();
    const image = this.state.fileMode ? this.state.image : '';

    Relay.Store.commitUpdate(
      new CreateCommentMutation({
        parent_type: annotated_type
          .replace(/([a-z])([A-Z])/, '$1_$2')
          .toLowerCase(),
        annotator,
        annotated,
        image,
        context: this.getContext(),
        annotation: {
          text: comment,
          annotated_type,
          annotated_id,
        },
      }),
      { onFailure: this.fail, onSuccess: this.resetState },
    );
  }

  updateComment(
    annotated,
    annotated_id,
    annotated_type,
    comment,
  ) {
    const image = this.state.fileMode ? this.state.image : '';
    const { annotation } = this.props;
    Relay.Store.commitUpdate(
      new UpdateCommentMutation({
        image,
        context: this.getContext(),
        text: comment,
        annotation,
        annotated,
      }),
      { onFailure: this.fail, onSuccess: this.resetState },
    );
  }

  addTag(annotated, annotated_id, annotated_type, tags) {
    const tagsList = [...new Set(tags.split(','))];

    const annotator = this.getContext().currentUser;

    const context = this.getContext();

    tagsList.forEach((tag) => {
      Relay.Store.commitUpdate(
        new CreateTagMutation({
          annotated,
          annotator,
          parent_type: annotated_type
            .replace(/([a-z])([A-Z])/, '$1_$2')
            .toLowerCase(),
          context,
          annotation: {
            tag: tag.trim(),
            annotated_type,
            annotated_id,
          },
        }),
        { onFailure: this.fail, onSuccess: this.resetState },
      );
    });
  }

  addStatus(annotated, annotated_id, annotated_type, status) {
    const annotator = this.getContext().currentUser;

    let status_id = '';
    if (annotated.last_status_obj !== null) {
      status_id = annotated.last_status_obj.id;
    }
    const status_attr = {
      parent_type: annotated_type
        .replace(/([a-z])([A-Z])/, '$1_$2')
        .toLowerCase(),
      annotated,
      annotator,
      context: this.getContext(),
      annotation: {
        status,
        annotated_type,
        annotated_id,
        status_id,
      },
    };
    // Add or Update status
    if (status_id && status_id.length) {
      Relay.Store.commitUpdate(new UpdateStatusMutation(status_attr), {
        onFailure: this.fail, onSuccess: this.resetState,
      });
    } else {
      Relay.Store.commitUpdate(new CreateStatusMutation(status_attr), {
        onFailure: this.fail, onSuccess: this.resetState,
      });
    }
  }

  addDynamic(annotated, annotated_id, annotated_type, params, annotation_type) {
    const annotator = this.getContext().currentUser;

    // /location location_name=Salvador&location_position=-12.9016241,-38.4198075
    const fields = {};
    if (params) {
      params.split('&').forEach((part) => {
        const [pair0, pair1] = part.split('=');
        fields[pair0] = pair1;
      });
    }

    Relay.Store.commitUpdate(
      new CreateDynamicMutation({
        parent_type: annotated_type
          .replace(/([a-z])([A-Z])/, '$1_$2')
          .toLowerCase(),
        annotator,
        annotated,
        context: this.getContext(),
        annotation: {
          fields,
          annotation_type,
          annotated_type,
          annotated_id,
        },
      }),
      { onFailure: this.fail, onSuccess: this.resetState },
    );
  }

  handleChange(e) {
    const canSubmit = e.target.value.trim().length > 0;
    this.setState({ cmd: e.target.value, message: null, canSubmit });
  }

  handleFocus() {
    this.setState({ message: null });
  }

  handleSubmit(e) {
    const command = AddAnnotation.parseCommand(this.state.cmd);
    const image = this.state.fileMode ? this.state.image : null;

    if (this.state.isSubmitting || (!this.state.cmd && !image)) {
      e.preventDefault();
      return;
    }

    this.setState({ isSubmitting: true });
    let action = null;

    if (this.props.types && this.props.types.indexOf(command.type) === -1) {
      this.invalidCommand();
    } else {
      switch (command.type) {
      case 'comment':
        action = this.props.editMode ? this.updateComment.bind(this) : this.addComment.bind(this);
        break;
      case 'tag':
        action = this.addTag.bind(this);
        break;
      case 'status':
        action = this.addStatus.bind(this);
        break;
      default:
        action = this.addDynamic.bind(this);
        break;
      }

      if (action) {
        const { annotated, annotatedType: annotated_type } = this.props;
        action(
          annotated,
          annotated.dbid,
          annotated_type,
          command.args,
          command.type,
        );
      } else {
        this.invalidCommand();
      }
    }

    e.preventDefault();
  }

  handleKeyUp(e) {
    if (e.target.value !== '' && this.state.canBeAutoChanged) {
      this.setState({ canBeAutoChanged: false });
    }
    if (e.target.value === '' && !this.state.canBeAutoChanged) {
      this.setState({ canBeAutoChanged: true });
    }
  }

  handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      this.handleSubmit(e);
    }
  }

  switchMode() {
    this.setState({ fileMode: !this.state.fileMode });
  }

  render() {
    const AddAnnotationButtonGroup = styled(Row)`
      align-items: center;
      display: flex;
      justify-content: flex-end;
      .add-annotation__insert-photo {
        svg {
          path { color: ${black38}; }
          &:hover path {
            color: ${black87};
            cusor: pointer;
          }
        }
      }
    `;

    const { annotated, annotatedType, editMode } = this.props;

    if (annotated.archived > CheckArchivedFlags.NONE) {
      return null;
    }
    if (annotatedType === 'ProjectMedia' && !(can(annotated.permissions, 'create Comment') || can(annotated.permissions, 'create Comment'))) {
      return null;
    }
    if (annotatedType === 'Task' && !can(annotated.permissions, 'update Task')) {
      return null;
    }

    const inputHint = editMode ? (<FormattedMessage id="addAnnotation.inputEditHint" defaultMessage="Edit note" />)
      : (<FormattedMessage id="addAnnotation.inputHint" defaultMessage="Add a note" />);
    return (
      <form
        className="add-annotation"
        onSubmit={this.handleSubmit.bind(this)}
        style={{
          height: '100%',
          width: '100%',
          paddingTop: units(2),
          position: 'relative',
          zIndex: 0,
        }}
      >
        <div style={editMode ? null : { padding: `0 ${units(4)}` }}>
          <TextField
            label={inputHint}
            onFocus={this.handleFocus.bind(this)}
            ref={(i) => { this.cmd = i; }}
            error={Boolean(this.state.message)}
            helperText={this.state.message}
            name="cmd"
            id="cmd-input"
            multiline
            fullWidth
            onKeyPress={this.handleKeyPress.bind(this)}
            onKeyUp={this.handleKeyUp.bind(this)}
            value={this.state.cmd}
            onChange={this.handleChange.bind(this)}
            variant="outlined"
          />
          {this.state.fileMode ? (
            <UploadFile
              type="image"
              value={this.state.image}
              onChange={this.onImageChange}
              onError={this.onImageError}
            />
          ) : null}
          <AddAnnotationButtonGroup className="add-annotation__buttons">
            <IconButton
              className={`add-annotation__insert-photo ${this.state.fileMode ? 'add-annotation__file' : ''}`}
              id="add-annotation__switcher"
              title={
                <FormattedMessage id="addAnnotation.addImage" defaultMessage="Add a file" />
              }
              onClick={this.switchMode.bind(this)}
            >
              <AttachFileIcon />
            </IconButton>
            { editMode ?
              <Button>
                <FormattedMessage {...globalStrings.cancel} />
              </Button> : null
            }
            <Button
              color="primary"
              type="submit"
              variant="contained"
              disabled={!this.state.canSubmit}
            >
              <FormattedMessage id="addAnnotation.submitButton" defaultMessage="Submit" />
            </Button>
          </AddAnnotationButtonGroup>
        </div>
      </form>
    );
  }
}

AddAnnotation.contextTypes = {
  store: PropTypes.object,
};

export default AddAnnotation;
