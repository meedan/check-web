import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import styled from 'styled-components';
import TextArea from '../cds/inputs/TextArea';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import AttachFileIcon from '../../icons/attach_file.svg';
import CreateCommentMutation from '../../relay/mutations/CreateCommentMutation';
import UpdateCommentMutation from '../../relay/mutations/UpdateCommentMutation';
import CreateTagMutation from '../../relay/mutations/CreateTagMutation';
import CreateStatusMutation from '../../relay/mutations/CreateStatusMutation';
import UpdateStatusMutation from '../../relay/mutations/UpdateStatusMutation';
import CreateDynamicMutation from '../../relay/mutations/CreateDynamicMutation';
import { can } from '../Can';
import CheckContext from '../../CheckContext';
import UploadFile from '../UploadFile';
import { Row, units } from '../../styles/js/shared';
import { getErrorMessage } from '../../helpers';
import { stringHelper } from '../../customHelpers';
import CheckArchivedFlags from '../../CheckArchivedFlags';

const messages = defineMessages({
  editNote: {
    id: 'addAnnotation.inputEditHint',
    defaultMessage: 'Edit note',
    description: 'Input help text about editing notes',
  },
  addNote: {
    id: 'addAnnotation.inputHint',
    defaultMessage: 'Add a note',
    description: 'Input help text about adding new notes',
  },
});

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
      cmd: props.cmdText ? props.cmdText : '',
      file: null,
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

  onFileChange = (file) => {
    const canSubmit = Boolean(this.state.cmd) || Boolean(file);
    this.setState({ file, message: null, canSubmit });
  }

  onFileError(file, message) {
    this.setState({ file: null, message });
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  invalidCommand() {
    this.setState({
      message: (
        <FormattedMessage id="addAnnotation.invalidCommand" defaultMessage="Invalid command" description="Error message when a command is invalid" />
      ),
      isSubmitting: false,
    });
  }

  resetState = () => {
    this.setState({
      cmd: '',
      file: null,
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
        description="Error message to try action again or contact support for more help"
        values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
      />
    );
    const message = getErrorMessage(transaction, fallbackMessage);
    this.setState({
      message: typeof message === 'string' ? message.replace(/<br\s*\/?>/gm, '; ') : message,
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
    const file = this.state.fileMode ? this.state.file : '';

    Relay.Store.commitUpdate(
      new CreateCommentMutation({
        parent_type: annotated_type
          .replace(/([a-z])([A-Z])/, '$1_$2')
          .toLowerCase(),
        annotator,
        annotated,
        file,
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
    const file = this.state.fileMode ? this.state.file : '';
    const { annotation } = this.props;
    Relay.Store.commitUpdate(
      new UpdateCommentMutation({
        file,
        context: this.getContext(),
        text: comment,
        annotation,
        annotated,
      }),
      { onFailure: this.fail, onSuccess: this.props.handleCloseEdit },
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
    const canSubmit = e.target.value.trim().length > 0 || Boolean(this.state.file);
    this.setState({ cmd: e.target.value, message: null, canSubmit });
  }

  handleFocus() {
    this.setState({ message: null });
  }

  handleSubmit(e) {
    const command = AddAnnotation.parseCommand(this.state.cmd);
    const file = this.state.fileMode ? this.state.file : null;

    if (this.state.isSubmitting || (!this.state.cmd && !file)) {
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
          path { color: var(--textDisabled); }
          &:hover path {
            color: var(--textPrimary);
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

    const inputHint = editMode ? this.props.intl.formatMessage(messages.editNote) : this.props.intl.formatMessage(messages.addNote);

    return (
      <form
        className="add-annotation"
        onSubmit={this.handleSubmit.bind(this)}
        style={{
          height: '100%',
          width: '100%',
          position: 'relative',
          zIndex: 0,
        }}
      >
        <div style={editMode ? null : { padding: `0 ${units(2)}` }}>
          <TextArea
            label={<FormattedMessage id="addAnnotation.inputLabel" defaultMessage="Note" description="Input label for creating a new note" />}
            onFocus={this.handleFocus.bind(this)}
            ref={(i) => { this.cmd = i; }}
            error={Boolean(this.state.message)}
            placeholder={inputHint}
            helpContent={this.state.message ? this.state.message : inputHint}
            name="cmd"
            componentProps={{
              id: 'cmd-input',
            }}
            onKeyPress={this.handleKeyPress.bind(this)}
            onKeyUp={this.handleKeyUp.bind(this)}
            value={this.state.cmd}
            onChange={this.handleChange.bind(this)}
          />
          {this.state.fileMode ? (
            <UploadFile
              type="file"
              value={this.state.file}
              onChange={this.onFileChange}
              onError={this.onFileError}
            />
          ) : null}
          <AddAnnotationButtonGroup className="add-annotation__buttons">
            <Tooltip arrow title={<FormattedMessage id="addAnnotation.addFile" defaultMessage="Add a file" description="Tooltip to tell the user they can add files" />}>
              <span>
                <ButtonMain
                  variant="text"
                  theme="lightText"
                  size="default"
                  iconCenter={<AttachFileIcon />}
                  className={`add-annotation__insert-photo ${this.state.fileMode ? 'add-annotation__file' : ''}`}
                  buttonProps={{
                    id: 'add-annotation__switcher',
                  }}
                  onClick={this.switchMode.bind(this)}
                />
              </span>
            </Tooltip>
            { editMode ?
              <ButtonMain
                variant="text"
                theme="text"
                size="default"
                onClick={this.props.handleCloseEdit}
                label={<FormattedMessage id="global.cancel" defaultMessage="Cancel" description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation" />}
              /> : null
            }
            <ButtonMain
              theme="brand"
              size="default"
              variant="contained"
              disabled={!this.state.canSubmit}
              label={<FormattedMessage id="addAnnotation.submitButton" defaultMessage="Submit" description="Button text for submitting the annotation form" />}
              buttonProps={{
                id: 'add-annotation_submit',
                type: 'submit',
              }}
            />
          </AddAnnotationButtonGroup>
        </div>
      </form>
    );
  }
}

AddAnnotation.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(AddAnnotation);
