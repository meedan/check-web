import React, { Component } from 'react';
import Relay from 'react-relay';
import { Card, CardHeader, CardActions, CardText } from 'material-ui/Card';
import Avatar from 'material-ui/Avatar';
import TextField from 'material-ui/TextField';
import {
  FormattedMessage,
  defineMessages,
  injectIntl,
  intlShape,
} from 'react-intl';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import IconMoreHoriz from 'material-ui/svg-icons/navigation/more-horiz';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import 'rc-tooltip/assets/bootstrap.css';
import SingleChoiceTask from './SingleChoiceTask';
import MultiSelectTask from './MultiSelectTask';
import Message from '../Message';
import UpdateTaskMutation from '../../relay/UpdateTaskMutation';
import UpdateDynamicMutation from '../../relay/UpdateDynamicMutation';
import DeleteAnnotationMutation from '../../relay/DeleteAnnotationMutation';
import Can from '../Can';
import ParsedText from '../ParsedText';
import GeolocationRespondTask from './GeolocationRespondTask';
import GeolocationTaskResponse from './GeolocationTaskResponse';
import DatetimeRespondTask from './DatetimeRespondTask';
import DatetimeTaskResponse from './DatetimeTaskResponse';
import { units } from '../../styles/js/variables';

const messages = defineMessages({
  confirmDelete: {
    id: 'task.confirmDelete',
    defaultMessage: 'Are you sure you want to delete this task?',
  },
});

class Task extends Component {
  constructor(props) {
    super(props);

    this.state = {
      focus: false,
      editing: false,
      message: null,
      editingResponse: false,
      isMenuOpen: false,
      taskAnswerDisabled: true,
    };
  }

  handleFocus() {
    this.setState({ focus: true });
  }

  handleCancelFocus() {
    this.setState({
      focus: false,
      response: null,
      responseOther: null,
      otherSelected: false,
    });
  }

  handleSubmit(e) {
    const that = this;
    const task = this.props.task;

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = error.source;
      try {
        const json = JSON.parse(error.source);
        if (json.error) {
          message = json.error;
        }
      } catch (e) {}
      that.setState({ message });
    };

    const onSuccess = (response) => {
      that.setState({ message: null });
    };

    const form = document.forms[`task-response-${task.id}`];
    const fields = {};
    fields[`response_${task.type}`] =
      this.state.response || form.response.value;
    fields[`note_${task.type}`] = form.note ? form.note.value : '';
    fields[`task_${task.type}`] = task.dbid;

    if (!that.state.taskAnswerDisabled) {
      Relay.Store.commitUpdate(
        new UpdateTaskMutation({
          annotated: that.props.media,
          task: {
            id: task.id,
            fields,
            annotation_type: `task_response_${task.type}`,
          },
        }),
        { onSuccess, onFailure },
      );
      that.setState({ taskAnswerDisabled: true });
    }

    e.preventDefault();
  }

  handleSubmitWithArgs(response, note) {
    const that = this;
    const task = this.props.task;

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = error.source;
      try {
        const json = JSON.parse(error.source);
        if (json.error) {
          message = json.error;
        }
      } catch (e) {}
      that.setState({ message });
    };

    const onSuccess = (response) => {
      that.setState({ message: null });
    };

    const fields = {};
    fields[`response_${task.type}`] = response;
    if (note !== false) {
      fields[`note_${task.type}`] = note || '';
    }
    fields[`task_${task.type}`] = task.dbid;

    Relay.Store.commitUpdate(
      new UpdateTaskMutation({
        annotated: that.props.media,
        task: {
          id: task.id,
          fields,
          annotation_type: `task_response_${task.type}`,
        },
      }),
      { onSuccess, onFailure },
    );
  }

  handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (this.canSubmit(e.target.value)) {
        this.setState({ taskAnswerDisabled: true });
        this.handleSubmit(e);
      }
      e.preventDefault();
    }
  }

  handleChange(e) {
    this.setState({ taskAnswerDisabled: !this.canSubmit(e.target.value) });
  }

  handleEdit() {
    this.setState({ editing: true, isMenuOpen: false });
  }

  handleCancelEdit() {
    this.setState({ editing: false });
  }

  handleUpdateTask(e) {
    const that = this;
    const task = this.props.task;
    const form = document.forms[`edit-task-${task.dbid}`];

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = error.source;
      try {
        const json = JSON.parse(error.source);
        if (json.error) {
          message = json.error;
        }
      } catch (e) {}
      that.setState({ message });
    };

    const onSuccess = (response) => {
      that.setState({ message: null, editing: false });
    };

    const taskObj = {
      id: task.id,
      label: form.label.value,
    };
    if (form.description) {
      taskObj.description = form.description.value;
    }

    Relay.Store.commitUpdate(
      new UpdateTaskMutation({
        annotated: that.props.media,
        task: taskObj,
      }),
      { onSuccess, onFailure },
    );

    e.preventDefault();
  }

  handleDelete() {
    if (window.confirm(this.props.intl.formatMessage(messages.confirmDelete))) {
      const that = this;
      Relay.Store.commitUpdate(
        new DeleteAnnotationMutation({
          parent_type: 'project_media',
          annotated: that.props.media,
          id: that.props.task.id,
        }),
      );
    }
    this.setState({ isMenuOpen: false });
  }

  handleCancelEditResponse() {
    this.setState({
      editingResponse: false,
      response: null,
      responseOther: null,
      otherSelected: false,
    });
  }

  handleEditResponse() {
    this.setState({ editingResponse: true });
  }

  handleKeyPressUpdate(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (this.canSubmit(e.target.value)) {
        this.setState({ taskAnswerDisabled: true });
        this.handleSubmitUpdate(e);
      }
      e.preventDefault();
    }
  }

  handleSubmitUpdate(e) {
    const that = this;
    const task = this.props.task;

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = error.source;
      try {
        const json = JSON.parse(error.source);
        if (json.error) {
          message = json.error;
        }
      } catch (e) {}
      that.setState({ message });
    };

    const onSuccess = () => {
      that.setState({ message: null, editingResponse: false });
    };

    const form = document.forms[`edit-response-${task.first_response.id}`];
    const fields = {};
    fields[`response_${task.type}`] =
      this.state.response || form.editedresponse.value;
    fields[`note_${task.type}`] = form.editednote ? form.editednote.value : '';

    if (!that.state.taskAnswerDisabled) {
      Relay.Store.commitUpdate(
        new UpdateDynamicMutation({
          annotated: that.props.media,
          dynamic: {
            id: task.first_response.id,
            fields,
          },
        }),
        { onSuccess, onFailure },
      );
      that.setState({ taskAnswerDisabled: true });
    }

    e.preventDefault();
  }

  handleSubmitUpdateWithArgs(edited_response, edited_note) {
    const that = this;
    const task = this.props.task;

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = error.source;
      try {
        const json = JSON.parse(error.source);
        if (json.error) {
          message = json.error;
        }
      } catch (e) {}
      that.setState({ message });
    };

    const onSuccess = () => {
      that.setState({ message: null, editingResponse: false });
    };

    const fields = {};
    fields[`response_${task.type}`] = edited_response;
    if (edited_note !== false) {
      fields[`note_${task.type}`] = edited_note;
    }

    Relay.Store.commitUpdate(
      new UpdateDynamicMutation({
        annotated: that.props.media,
        dynamic: {
          id: task.first_response.id,
          fields,
        },
      }),
      { onSuccess, onFailure },
    );
  }

  toggleMenu() {
    this.setState({ isMenuOpen: !this.state.isMenuOpen });
  }

  bemClass(baseClass, modifierBoolean, modifierSuffix) {
    return modifierBoolean
      ? [baseClass, baseClass + modifierSuffix].join(' ')
      : baseClass;
  }

  componentDidMount() {
    const that = this;
    window.addEventListener('click', () => {
      that.setState({ focus: false });
    });
  }

  canSubmit(value) {
    if (typeof value !== 'undefined' && value !== null) {
      return !!value.trim();
    }
    const task = this.props.task;
    const form_id = this.state.editingResponse
      ? `edit-response-${task.first_response.id}`
      : `task-response-${task.id}`;
    const form = document.forms[form_id];
    const form_value = this.state.editingResponse
      ? form.editedresponse.value
      : form.response.value;
    const state_response = this.state.response
      ? this.state.response.trim()
      : null;

    return !!state_response || !!form_value.trim();
  }

  getResponseData() {
    const data = {};

    const { task } = this.props;

    if (task.first_response) {
      data.by = task.first_response.annotator;
      const fields = JSON.parse(task.first_response.content);
      fields.forEach((field) => {
        if (/^response_/.test(field.field_name)) {
          data.response = field.value;
        }
        if (/^note_/.test(field.field_name)) {
          data.note = field.value;
        }
      });
    }

    return data;
  }

  handleCancel(task) {
    document.getElementById(`task__label-${task.id}`).click();
  }

  render() {
    const { task } = this.props;
    const data = this.getResponseData();
    const { response } = data;
    const { note } = data;
    const { by } = data;

    const createTaskActions = [
      <FlatButton
        key="tasks__cancel"
        label={
          <FormattedMessage id="tasks.cancelEdit" defaultMessage="Cancel" />
        }
        primary
        onClick={this.handleCancelEdit.bind(this)}
      />,
      <FlatButton
        key="task__save"
        className="task__save"
        label={<FormattedMessage id="tasks.save" defaultMessage="Save" />}
        primary
        keyboardFocused
        onClick={this.handleUpdateTask.bind(this)}
      />,
    ];

    const taskActions = (
      <div
        style={{
          marginLeft: 'auto',
          position: 'absolute',
          bottom: '0',
          right: '0',
        }}
      >
        <Can permissions={task.permissions} permission="update Task">
          <IconMenu
            className="task-actions"
            iconButtonElement={
              <IconButton>
                <IconMoreHoriz className="task-actions__icon" />
              </IconButton>
            }
          >
            {response ?
              <Can
                permissions={task.first_response.permissions}
                permission="update Dynamic"
              >
                <MenuItem
                  className="task-actions__edit-response"
                  onClick={this.handleEditResponse.bind(this)}
                >
                  <FormattedMessage id="task.editResponse" defaultMessage="Edit response" />
                </MenuItem>
              </Can>
              : null
           }

            <MenuItem
              className="task-actions__edit"
              onClick={this.handleEdit.bind(this)}
            >
              <FormattedMessage id="task.edit" defaultMessage="Edit question" />
            </MenuItem>
            <Can permissions={task.permissions} permission="destroy Task">
              <MenuItem
                className="task-actions__delete"
                onClick={this.handleDelete.bind(this)}
              >
                <FormattedMessage
                  id="task.delete"
                  defaultMessage="Delete task"
                />
              </MenuItem>
            </Can>
          </IconMenu>
        </Can>
      </div>
    );

    const taskQuestion = (
      <div className="task__question">
        <div className="task__label-container">
          <span className="task__label">{task.label}</span>
        </div>
      </div>
    );

    const taskBody = !response
      ? (<form
        onSubmit={this.handleSubmit.bind(this)}
        name={`task-response-${task.id}`}
      >

        <div className="task__response-inputs">
          {task.type === 'geolocation'
              ? <GeolocationRespondTask
                onCancel={this.handleCancel.bind(this, task)}
                onSubmit={this.handleSubmitWithArgs.bind(this)}
              />
              : null}
          {task.type === 'datetime'
              ? <DatetimeRespondTask
                onSubmit={this.handleSubmitWithArgs.bind(this)}
                note={''}
              />
              : null}
          {task.type === 'single_choice'
              ? <SingleChoiceTask
                mode="respond"
                response={response}
                note={note}
                jsonoptions={task.jsonoptions}
                onSubmit={this.handleSubmitWithArgs.bind(this)}
              />
              : null}
          {task.type === 'multiple_choice'
              ? <MultiSelectTask
                mode="respond"
                jsonresponse={response}
                note={note}
                jsonoptions={task.jsonoptions}
                onSubmit={this.handleSubmitWithArgs.bind(this)}
              />
              : null}
          {task.type === 'free_text'
              ? [
                <TextField
                  key="task__response-input"
                  className="task__response-input"
                  onFocus={this.handleFocus.bind(this)}
                  name="response"
                  onKeyPress={this.handleKeyPress.bind(this)}
                  onChange={this.handleChange.bind(this)}
                  fullWidth
                  multiLine
                />,
                <TextField
                  key="task__response-note-input"
                  className="task__response-note-input"
                  hintText={
                    <FormattedMessage
                      id="task.noteLabel"
                      defaultMessage="Note any additional details here."
                    />
                    }
                  name="note"
                  onKeyPress={this.handleKeyPress.bind(this)}
                  onChange={this.handleChange.bind(this)}
                  fullWidth
                  multiLine
                />,
                <p key="task__resolver" className="task__resolver">
                  <small>
                    <FormattedMessage
                      id="task.pressReturnToSave"
                      defaultMessage="Press return to save your response"
                    />
                  </small>
                </p>,
              ]
              : null}
        </div>
      </form>)
      : this.state.editingResponse
        ? <div className="task__editing">
          <form
            onSubmit={this.handleSubmitUpdate.bind(this)}
            name={`edit-response-${task.first_response.id}`}
          >
            {task.type === 'geolocation'
                ? <GeolocationRespondTask
                  onCancel={this.handleCancel.bind(this, task)}
                  response={response}
                  onSubmit={this.handleSubmitUpdateWithArgs.bind(this)}
                  onDismiss={this.handleCancelEditResponse.bind(this)}
                />
                : null}
            {task.type === 'datetime'
                ? <DatetimeRespondTask
                  response={response}
                  note={note}
                  onSubmit={this.handleSubmitUpdateWithArgs.bind(this)}
                  onDismiss={this.handleCancelEditResponse.bind(this)}
                />
                : null}
            {task.type === 'single_choice'
                ? <SingleChoiceTask
                  mode="edit_response"
                  response={response}
                  note={note}
                  jsonoptions={task.jsonoptions}
                  onDismiss={this.handleCancelEditResponse.bind(this)}
                  onSubmit={this.handleSubmitUpdateWithArgs.bind(this)}
                />
                : null}
            {task.type === 'multiple_choice'
                ? <MultiSelectTask
                  mode="edit_response"
                  jsonresponse={response}
                  note={note}
                  jsonoptions={task.jsonoptions}
                  onDismiss={this.handleCancelEditResponse.bind(this)}
                  onSubmit={this.handleSubmitUpdateWithArgs.bind(this)}
                />
                : null}
            {task.type === 'free_text'
                ? [
                  <TextField
                    key="task__response-input"
                    className="task__response-input"
                    defaultValue={response}
                    name="editedresponse"
                    onKeyPress={this.handleKeyPressUpdate.bind(this)}
                    onChange={this.handleChange.bind(this)}
                    fullWidth
                    multiLine
                  />,
                  <TextField
                    key="task__response-note-label"
                    hintText={
                      <FormattedMessage
                        id="task.noteLabel"
                        defaultMessage="Note any additional details here."
                      />
                      }
                    defaultValue={note}
                    name="editednote"
                    onKeyPress={this.handleKeyPressUpdate.bind(this)}
                    onChange={this.handleChange.bind(this)}
                    fullWidth
                    multiLine
                  />,
                  <p key="task__resolver" className="task__resolver">
                    <small>
                      <FormattedMessage
                        id="task.pressReturnToSave"
                        defaultMessage="Press return to save your response"
                      />
                    </small>{' '}
                    <span
                      id="task__cancel-button"
                      onClick={this.handleCancelEditResponse.bind(this)}
                    >
                        ✖
                      </span>
                  </p>,
                ]
                : null}
          </form>
        </div>
        : <div className="task__resolved">
          {task.type === 'free_text'
              ? <p className="task__response">
                <ParsedText text={response} />
              </p>
              : null}
          {task.type === 'geolocation'
              ? <p className="task__response">
                <GeolocationTaskResponse response={response} />
              </p>
              : null}
          {task.type === 'datetime'
              ? <p className="task__response">
                <DatetimeTaskResponse response={response} />
              </p>
              : null}
          {task.type === 'single_choice'
              ? <SingleChoiceTask
                mode="show_response"
                response={response}
                note={note}
                jsonoptions={task.jsonoptions}
              />
              : null}
          {task.type === 'multiple_choice'
              ? <MultiSelectTask
                mode="show_response"
                jsonresponse={response}
                note={note}
                jsonoptions={task.jsonoptions}
              />
              : null}
          <p
            style={{
              display: note ? 'block' : 'none',
              marginTop: units(2),
            }}
            className="task__note"
          >
            <ParsedText text={note} />
          </p>
        </div>;

    return (
      <div>
        <Card className="task" style={{ marginBottom: units(1) }}>
          <CardHeader
            actAsExpander
            showExpandableButton
            title={taskQuestion}
            subtitle={task.description ? task.description : null}
            id={`task__label-${task.id}`}
          />

          <CardText expandable className="task__card-text">
            <Message message={this.state.message} />
            {taskBody}
          </CardText>

          <CardActions
            expandable={!data.by}
            style={{ display: 'flex', alignItems: 'center' }}
          >

            { data.by ?
              <div
                className="task__resolver"
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <Avatar
                  style={{ margin: `0 ${units(1)}` }}
                  size={parseInt(units(3), 10)}
                  src={by.profile_image}
                />
                <small>
                  <FormattedMessage
                    id="task.resolvedBy"
                    defaultMessage={'Resolved by {byName}'}
                    values={{ byName: by.name }}
                  />
                </small>
              </div> : null }
            {taskActions}
          </CardActions>
        </Card>

        <Dialog
          actions={createTaskActions}
          modal={false}
          open={!!this.state.editing}
          onRequestClose={this.handleCancelEdit.bind(this)}
        >
          <Message message={this.state.message} />
          <form name={`edit-task-${task.dbid}`}>
            <TextField
              name="label"
              floatingLabelText={
                <FormattedMessage
                  id="tasks.taskLabel"
                  defaultMessage="Task label"
                />
              }
              defaultValue={task.label}
              fullWidth
              multiLine
            />
            {task.type === 'geolocation'
              ? null
              : <TextField
                name="description"
                floatingLabelText={
                  <FormattedMessage
                    id="tasks.description"
                    defaultMessage="Description"
                  />
                  }
                defaultValue={task.description}
                fullWidth
                multiLine
              />}
          </form>
        </Dialog>
      </div>
    );
  }
}

Task.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(Task);
