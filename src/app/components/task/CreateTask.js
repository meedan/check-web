import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import Checkbox from 'material-ui/Checkbox';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import Can from '../Can';
import CreateTaskMutation from '../../relay/mutations/CreateTaskMutation';
import Message from '../Message';
import CheckContext from '../../CheckContext';
import CreateTaskMenu from './CreateTaskMenu';
import SingleChoiceTask from './SingleChoiceTask';
import MultiSelectTask from './MultiSelectTask';
import Attribution from './Attribution';
import ConfirmRequired from './ConfirmRequired';
import TeamwideTasksNudgeDialog from './TeamwideTasksNudgeDialog';
import { safelyParseJSON, getStatus } from '../../helpers';
import { mediaStatuses, mediaLastStatus } from '../../customHelpers';
import { StyledTaskDescription } from '../../styles/js/shared';

const messages = defineMessages({
  newTask: {
    id: 'createTask.newTask',
    defaultMessage: 'New task',
  },
});

class CreateTask extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dialogOpen: false,
      type: null,
      label: null,
      description: null,
      message: null,
      nudgeDialogOpen: false,
      submitDisabled: true,
      showAssignmentField: false,
      required: false,
      confirmRequired: false,
    };
  }

  static getAssignment() {
    let assignment = document.getElementById('attribution-new');
    if (assignment) {
      assignment = parseInt(assignment.value, 10);
    } else {
      assignment = 0;
    }
    return assignment;
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  handleOpenDialog(type) {
    this.setState({
      dialogOpen: true,
      type,
      submitDisabled: true,
    });
  }

  handleTeamwideNudgeDialog() {
    const { team } = this.getContext();
    if (team.plan === 'pro') {
      this.setState({ nudgeDialogOpen: false });
      window.open(config.restBaseUrl.replace('/api/', `/admin/team/${team.dbid}/edit`), '_blank');
    } else {
      this.setState({ nudgeDialogOpen: true });
    }
  }

  handleCloseTeamwideNudgeDialog() {
    this.setState({ nudgeDialogOpen: false });
  }

  handleCloseDialog() {
    this.setState({ dialogOpen: false, type: null, showAssignmentField: false });
  }

  handleSubmitTask() {
    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = error.source;
      const json = safelyParseJSON(error.source);
      if (json && json.error) {
        message = json.error;
      }
      this.setState({ message });
    };

    const onSuccess = () => {
      this.setState({
        dialogOpen: false,
        label: '',
        description: '',
        type: null,
        message: null,
        showAssignmentField: false,
        required: false,
      });
    };

    if (!this.state.submitDisabled) {
      Relay.Store.commitUpdate(
        new CreateTaskMutation({
          label: this.state.label,
          type: this.state.type,
          required: this.state.required,
          description: this.state.description,
          annotated_type: 'ProjectMedia',
          annotated_id: this.props.media.id,
          annotated_dbid: `${this.props.media.dbid}`,
          assigned_to_id: CreateTask.getAssignment(),
        }),
        { onSuccess, onFailure },
      );
      this.setState({ submitDisabled: true });
    }
  }

  handleSubmitTaskObj(task) {
    const {
      label,
      description,
      required,
      jsonoptions,
    } = task;

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = error.source;
      const json = safelyParseJSON(error.source);
      if (json && json.error) {
        message = json.error;
      }
      this.setState({ message });
    };

    const onSuccess = () => {
      this.setState({
        dialogOpen: false,
        type: null,
        message: null,
        showAssignmentField: false,
      });
    };

    Relay.Store.commitUpdate(
      new CreateTaskMutation({
        label,
        description,
        required,
        type: this.state.type,
        jsonoptions,
        annotated_type: 'ProjectMedia',
        annotated_id: this.props.media.id,
        annotated_dbid: `${this.props.media.dbid}`,
        assigned_to_id: CreateTask.getAssignment(),
      }),
      { onSuccess, onFailure },
    );
  }

  handleLabelChange(e) {
    this.setState({ label: e.target.value });

    if (['free_text', 'geolocation', 'datetime'].includes(this.state.type)) {
      this.validateShortText(e.target.value);
    }
  }

  handleDescriptionChange(e) {
    this.setState({ description: e.target.value });
  }

  handleSelectRequired(e, inputChecked) {
    const { media } = this.props;
    const status = getStatus(mediaStatuses(media), mediaLastStatus(media));

    if (inputChecked && status.completed && !media.last_status_obj.locked) {
      this.setState({ required: inputChecked, confirmRequired: true, status });
    } else {
      this.setState({ required: inputChecked });
    }
  }

  handleSelectType = (type) => {
    if (type === 'teamwide') {
      this.handleTeamwideNudgeDialog();
    } else {
      this.handleOpenDialog(type);
    }
  };

  toggleAssignmentField() {
    this.setState({ showAssignmentField: !this.state.showAssignmentField });
  }

  validateShortText(label) {
    const valid = !!(label && label.trim());
    this.setState({ submitDisabled: !valid });
    return valid;
  }

  renderDialog() {
    if (this.state.dialogOpen) {
      return (
        <div>
          {this.state.type === 'single_choice'
            ? <SingleChoiceTask
              mode="create"
              media={this.props.media}
              onSubmit={this.handleSubmitTaskObj.bind(this)}
              onDismiss={this.handleCloseDialog.bind(this)}
            />
            : null}
          {this.state.type === 'multiple_choice'
            ? <MultiSelectTask
              mode="create"
              media={this.props.media}
              onSubmit={this.handleSubmitTaskObj.bind(this)}
              onDismiss={this.handleCloseDialog.bind(this)}
            />
            : null}
        </div>
      );
    }

    return null;
  }

  render() {
    const { media } = this.props;

    const actions = [
      <FlatButton
        label={<FormattedMessage id="tasks.cancelAdd" defaultMessage="Cancel" />}
        onClick={this.handleCloseDialog.bind(this)}
      />,
      <FlatButton
        className="create-task__dialog-submit-button"
        label={<FormattedMessage id="tasks.add" defaultMessage="Create Task" />}
        primary
        keyboardFocused
        onClick={this.handleSubmitTask.bind(this)}
        disabled={this.state.submitDisabled}
      />,
    ];

    if (media.archived) {
      return null;
    }

    return (
      <div>

        <Can permissions={media.permissions} permission="create Task">
          <CreateTaskMenu onSelect={this.handleSelectType} />
        </Can>

        <TeamwideTasksNudgeDialog
          open={this.state.nudgeDialogOpen}
          onDismiss={this.handleCloseTeamwideNudgeDialog.bind(this)}
        />

        <Dialog
          title={this.props.intl.formatMessage(messages.newTask)}
          className="create-task__dialog"
          actionsContainerClassName="create-task__action-container"
          actions={actions}
          modal={false}
          open={
            this.state.dialogOpen && ['free_text', 'geolocation', 'datetime'].includes(this.state.type)
          }
          onRequestClose={this.handleCloseDialog.bind(this)}
        >
          <Message message={this.state.message} />

          <TextField
            id="task-label-input"
            className="create-task__task-label-input"
            fullWidth
            floatingLabelText={
              <FormattedMessage id="tasks.taskLabel" defaultMessage="Prompt" />
            }
            onChange={this.handleLabelChange.bind(this)}
            multiLine
          />

          <Checkbox
            label={
              <FormattedMessage
                id="tasks.requiredCheckbox"
                defaultMessage="Required"
              />
            }
            checked={this.state.required}
            onCheck={this.handleSelectRequired.bind(this)}
          />
          <ConfirmRequired
            open={this.state.confirmRequired}
            status={this.state.status}
            handleCancel={() => { this.setState({ required: false, confirmRequired: false }); }}
            handleConfirm={() => { this.setState({ confirmRequired: false }); }}
          />

          <StyledTaskDescription>
            <input
              className="create-task__add-task-description"
              id="create-task__add-task-description"
              type="checkbox"
            />
            <TextField
              id="task-description-input"
              className="create-task__task-description-input"
              floatingLabelText={
                <FormattedMessage id="tasks.description" defaultMessage="Description" />
              }
              onChange={this.handleDescriptionChange.bind(this)}
              multiLine
            />
            <label
              className="create-task__add-task-description-label"
              htmlFor="create-task__add-task-description"
            >
              <span className="create-task__add-task-description-icon">
                  +
              </span>{' '}
              <FormattedMessage id="tasks.addDescription" defaultMessage="Add a description" />
            </label>

            { this.state.showAssignmentField ?
              <Attribution
                multi={false}
                selectedUsers={[]}
                id="new"
                taskType={this.state.type}
              /> :
              <button
                className="create-task__add-assignment-button"
                onClick={this.toggleAssignmentField.bind(this)}
              >
                {'+ '}
                <FormattedMessage id="tasks.assign" defaultMessage="Assign" />
              </button>
            }
          </StyledTaskDescription>
        </Dialog>

        {this.renderDialog()}
      </div>
    );
  }
}

CreateTask.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(CreateTask);
