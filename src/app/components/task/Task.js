import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import { Card, CardHeader, CardActions, CardText } from 'material-ui/Card';
import Checkbox from 'material-ui/Checkbox';
import TextField from 'material-ui/TextField';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import IconMoreHoriz from 'material-ui/svg-icons/navigation/more-horiz';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import styled from 'styled-components';
import SingleChoiceTask from './SingleChoiceTask';
import MultiSelectTask from './MultiSelectTask';
import Message from '../Message';
import UpdateTaskMutation from '../../relay/mutations/UpdateTaskMutation';
import UpdateDynamicMutation from '../../relay/mutations/UpdateDynamicMutation';
import DeleteAnnotationMutation from '../../relay/mutations/DeleteAnnotationMutation';
import Can, { can } from '../Can';
import ParsedText from '../ParsedText';
import ShortTextRespondTask from './ShortTextRespondTask';
import GeolocationRespondTask from './GeolocationRespondTask';
import GeolocationTaskResponse from './GeolocationTaskResponse';
import DatetimeRespondTask from './DatetimeRespondTask';
import DatetimeTaskResponse from './DatetimeTaskResponse';
import { Row, units, black10, title1 } from '../../styles/js/shared';
import ProfileLink from '../layout/ProfileLink';
import UserAvatar from '../UserAvatar';
import Attribution from './Attribution';
import Sentence from '../Sentence';
import { safelyParseJSON } from '../../helpers';
import TaskLog from './TaskLog';

const StyledWordBreakDiv = styled.div`
  hyphens: auto;
  overflow-wrap: break-word;
  word-break: break-word;
`;

const messages = defineMessages({
  confirmDelete: {
    id: 'task.confirmDelete',
    defaultMessage: 'Are you sure you want to delete this task?',
  },
});

const StyledRequiredIndicator = styled.span`
  color: red;
  font-weight: normal;
  font: ${title1};
  line-height: 20px;
`;

const RequiredIndicator = props => (
  <StyledRequiredIndicator className="task__required">
    { props.required ? '*' : null}
  </StyledRequiredIndicator>
);

class Task extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editingQuestion: false,
      message: null,
      editingResponse: false,
      submitDisabled: true,
      editingAttribution: false,
      required: null,
    };
  }

  getAssignment() {
    let assignment = document.getElementById(`attribution-${this.props.task.dbid}`);
    if (assignment) {
      assignment = parseInt(assignment.value, 10);
    } else {
      assignment = 0;
    }
    return assignment;
  }

  getResponseData() {
    const data = {};
    const { task, media } = this.props;

    if (task.first_response) {
      data.by = [];
      data.byPictures = [];
      let i = 0;
      task.first_response.attribution.edges.forEach((user) => {
        const u = user.node;
        data.by.push(<ProfileLink user={u} team={media.team} />);
        const style = {
          zIndex: i,
          display: 'inline-block',
          border: `1px solid ${black10}`,
          position: 'absolute',
          top: 0,
          left: i * 10,
        };
        data.byPictures.push(<UserAvatar user={u} key={u.dbid} size="extraSmall" style={style} />);
        i += 1;
      });
      const fields = JSON.parse(task.first_response.content);
      fields.forEach((field) => {
        if (/^response_/.test(field.field_name) && field.value && field.value !== '') {
          data.response = field.value;
        }
        if (/^note_/.test(field.field_name)) {
          data.note = field.value;
        }
      });
    }

    return data;
  }

  assignmentChanged(option) {
    const assignee = this.props.task.assigned_to;
    if ((assignee && option.value !== assignee.dbid) || (!assignee && option.value > 0)) {
      this.setState({ submitDisabled: false });
    }
  }

  canSubmit() {
    const label = typeof this.state.label !== 'undefined' && this.state.label !== null
      ? this.state.label : this.props.task.label || '';

    this.setState({ submitDisabled: !label });
  }

  handleSubmitWithArgs(response, note) {
    const { media, task } = this.props;

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
      this.setState({ message: null });
    };

    const fields = {};
    fields[`response_${task.type}`] = response;
    if (note !== false) {
      fields[`note_${task.type}`] = note || '';
    }
    fields[`task_${task.type}`] = task.dbid;

    Relay.Store.commitUpdate(
      new UpdateTaskMutation({
        annotated: media,
        task: {
          id: task.id,
          fields,
          annotation_type: `task_response_${task.type}`,
        },
      }),
      { onSuccess, onFailure },
    );
  }

  handleEditQuestion() {
    this.setState({ editingQuestion: true });
  }

  handleCancelQuestionEdit() {
    this.setState({ editingQuestion: false, submitDisabled: true, required: null });
  }

  handleCancelAttributionEdit() {
    this.setState({ editingAttribution: false });
  }

  handleQuestionEdit(e) {
    const state = {};
    state[e.target.name] = e.target.value;
    this.setState(state, this.canSubmit);
  }

  handleSelectRequired(e, inputChecked) {
    this.setState({ required: inputChecked, submitDisabled: false });
  }

  handleUpdateAttribution() {
    const { media, task } = this.props;
    // TODO Use React ref
    const { value } = document.getElementById(`attribution-${task.dbid}`);

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let { message } = error;
      const json = safelyParseJSON(error.source);
      if (json && json.error) {
        message = json.error;
      }
      this.setState({ message });
    };

    const onSuccess = () => {
      this.setState({ message: null, editingAttribution: false });
    };

    Relay.Store.commitUpdate(
      new UpdateDynamicMutation({
        annotated: media,
        parent_type: 'project_media',
        dynamic: {
          id: task.first_response.id,
          set_attribution: value,
        },
      }),
      { onSuccess, onFailure },
    );
  }

  handleUpdateTask(e) {
    const { media, task } = this.props;
    const form = document.forms[`edit-task-${task.dbid}`];

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
      this.setState({ message: null, editingQuestion: false, required: null });
    };

    const taskObj = {
      id: task.id,
      label: form.label.value,
      required: this.state.required !== null ? this.state.required : task.required,
      assigned_to_id: this.getAssignment(),
    };

    if (form.description) {
      taskObj.description = form.description.value || null;
    }

    if (!this.state.submitDisabled) {
      Relay.Store.commitUpdate(
        new UpdateTaskMutation({
          annotated: media,
          task: taskObj,
        }),
        { onSuccess, onFailure },
      );
    }
    this.setState({ submitDisabled: true });

    e.preventDefault();
  }

  handleDelete() {
    const { task, media } = this.props;

    // eslint-disable-next-line no-alert
    if (window.confirm(this.props.intl.formatMessage(messages.confirmDelete))) {
      Relay.Store.commitUpdate(new DeleteAnnotationMutation({
        parent_type: 'project_media',
        annotated: media,
        id: task.id,
      }));
    }
  }

  handleCancelEditResponse() {
    this.setState({
      editingResponse: false,
    });
  }

  handleEditResponse() {
    this.setState({ editingResponse: true });
  }

  handleEditAttribution() {
    this.setState({ editingAttribution: true });
  }

  handleSubmitUpdateWithArgs(edited_response, edited_note) {
    const { media, task } = this.props;

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
      this.setState({ message: null, editingResponse: false });
    };

    const fields = {};
    fields[`response_${task.type}`] = edited_response;
    if (edited_note !== false) {
      fields[`note_${task.type}`] = edited_note;
    }

    Relay.Store.commitUpdate(
      new UpdateDynamicMutation({
        annotated: media,
        parent_type: 'project_media',
        dynamic: {
          id: task.first_response.id,
          fields,
        },
      }),
      { onSuccess, onFailure },
    );
  }

  render() {
    const { task, media } = this.props;
    const data = this.getResponseData();
    const {
      response, note, by, byPictures,
    } = data;

    const editQuestionActions = [
      <FlatButton
        key="tasks__cancel"
        label={<FormattedMessage id="tasks.cancelEdit" defaultMessage="Cancel" />}
        onClick={this.handleCancelQuestionEdit.bind(this)}
      />,
      <FlatButton
        key="task__save"
        className="task__save"
        label={<FormattedMessage id="tasks.save" defaultMessage="Save" />}
        primary
        keyboardFocused
        onClick={this.handleUpdateTask.bind(this)}
        disabled={this.state.submitDisabled}
      />,
    ];

    const editAttributionActions = [
      <FlatButton
        key="tasks__cancel"
        label={<FormattedMessage id="tasks.cancelEdit" defaultMessage="Cancel" />}
        onClick={this.handleCancelAttributionEdit.bind(this)}
      />,
      <FlatButton
        key="task__save"
        className="task__save"
        label={<FormattedMessage id="tasks.done" defaultMessage="Done" />}
        primary
        keyboardFocused
        onClick={this.handleUpdateAttribution.bind(this)}
      />,
    ];

    const taskAssignment = task.assigned_to && !response ? (
      <div className="task__assigned" style={{ display: 'flex', alignItems: 'center' }}>
        <small style={{ display: 'flex' }}>
          <UserAvatar
            user={task.assigned_to}
            size="extraSmall"
            style={{ display: 'inline-block', border: `1px solid ${black10}` }}
          />
          <span style={{ lineHeight: '24px', paddingLeft: units(1), paddingRight: units(1) }}>
            <FormattedMessage
              id="task.assignedTo"
              defaultMessage="Assigned to {name}"
              values={{ name: <ProfileLink user={task.assigned_to} team={media.team} /> }}
            />
          </span>
        </small>
      </div>
    ) : null;

    const taskActions = !media.archived ? (
      <div>
        {taskAssignment}
        {data.by && task.status === 'Resolved' ?
          <div className="task__resolver" style={{ display: 'flex', alignItems: 'center', marginTop: units(1) }}>
            <small style={{ display: 'flex' }}>
              <span style={{ position: 'relative', width: 24 + ((byPictures.length - 1) * 10) }}>
                {byPictures}
              </span>
              <span style={{ lineHeight: '24px', paddingLeft: units(1), paddingRight: units(1) }}>
                <FormattedMessage
                  id="task.resolvedBy"
                  defaultMessage="Resolved by {byName}"
                  values={{ byName: <Sentence list={by} /> }}
                />
              </span>
            </small>
          </div>
          : null}
        <div
          style={{
            marginLeft: 'auto',
            position: 'absolute',
            bottom: '0',
            right: units(0.5),
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
                <Can permissions={task.first_response.permissions} permission="update Dynamic">
                  <MenuItem className="task-actions__edit-response" onClick={this.handleEditResponse.bind(this)}>
                    <FormattedMessage id="task.editResponse" defaultMessage="Edit response" />
                  </MenuItem>
                </Can>
                : null}

              <MenuItem className="task-actions__edit" onClick={this.handleEditQuestion.bind(this)}>
                <FormattedMessage id="task.edit" defaultMessage="Edit question" />
              </MenuItem>

              <MenuItem className="task-actions__assign" onClick={this.handleEditQuestion.bind(this)}>
                {task.assigned_to ?
                  <FormattedMessage id="task.unassign" defaultMessage="Unassign" /> :
                  <FormattedMessage id="task.assign" defaultMessage="Assign" />}
              </MenuItem>

              {(response && can(task.first_response.permissions, 'update Dynamic')) ?
                <MenuItem className="task-actions__edit-attribution" onClick={this.handleEditAttribution.bind(this)}>
                  <FormattedMessage id="task.editAttribution" defaultMessage="Edit attribution" />
                </MenuItem>
                : null}

              <Can permissions={task.permissions} permission="destroy Task">
                <MenuItem className="task-actions__delete" onClick={this.handleDelete.bind(this)}>
                  <FormattedMessage id="task.delete" defaultMessage="Delete task" />
                </MenuItem>
              </Can>
            </IconMenu>
          </Can>
        </div>
      </div>
    ) : null;

    const taskQuestion = (
      <div className="task__question">
        <div className="task__label-container">
          <Row>
            <span className="task__label">
              {task.label}
            </span>
            <RequiredIndicator required={task.required} />
          </Row>
        </div>
      </div>
    );

    let taskBody = null;
    if (!response && !media.archived) {
      taskBody = (
        <Can permissions={media.permissions} permission="create Dynamic">
          <div>
            <form name={`task-response-${task.id}`}>

              <div className="task__response-inputs">
                {task.type === 'free_text' ?
                  <ShortTextRespondTask
                    onSubmit={this.handleSubmitWithArgs.bind(this)}
                  />
                  : null}
                {task.type === 'geolocation' ?
                  <GeolocationRespondTask
                    onSubmit={this.handleSubmitWithArgs.bind(this)}
                  /> : null}
                {task.type === 'datetime' ?
                  <DatetimeRespondTask onSubmit={this.handleSubmitWithArgs.bind(this)} note="" />
                  : null}
                {task.type === 'single_choice' ?
                  <SingleChoiceTask
                    mode="respond"
                    response={response}
                    note={note}
                    jsonoptions={task.jsonoptions}
                    onSubmit={this.handleSubmitWithArgs.bind(this)}
                  />
                  : null}
                {task.type === 'multiple_choice' ?
                  <MultiSelectTask
                    mode="respond"
                    jsonresponse={response}
                    note={note}
                    jsonoptions={task.jsonoptions}
                    onSubmit={this.handleSubmitWithArgs.bind(this)}
                  />
                  : null}
              </div>
            </form>
          </div>
        </Can>
      );
    } else if (this.state.editingResponse) {
      taskBody = (
        <div className="task__editing">
          <form name={`edit-response-${task.first_response.id}`}>
            {task.type === 'free_text' ?
              <ShortTextRespondTask
                response={response}
                note={note}
                onSubmit={this.handleSubmitUpdateWithArgs.bind(this)}
                onDismiss={this.handleCancelEditResponse.bind(this)}
              />
              : null}
            {task.type === 'geolocation' ?
              <GeolocationRespondTask
                response={response}
                onSubmit={this.handleSubmitUpdateWithArgs.bind(this)}
                onDismiss={this.handleCancelEditResponse.bind(this)}
              />
              : null}
            {task.type === 'datetime' ?
              <DatetimeRespondTask
                response={response}
                note={note}
                onSubmit={this.handleSubmitUpdateWithArgs.bind(this)}
                onDismiss={this.handleCancelEditResponse.bind(this)}
              />
              : null}
            {task.type === 'single_choice' ?
              <SingleChoiceTask
                mode="edit_response"
                response={response}
                note={note}
                jsonoptions={task.jsonoptions}
                onDismiss={this.handleCancelEditResponse.bind(this)}
                onSubmit={this.handleSubmitUpdateWithArgs.bind(this)}
              />
              : null}
            {task.type === 'multiple_choice' ?
              <MultiSelectTask
                mode="edit_response"
                jsonresponse={response}
                note={note}
                jsonoptions={task.jsonoptions}
                onDismiss={this.handleCancelEditResponse.bind(this)}
                onSubmit={this.handleSubmitUpdateWithArgs.bind(this)}
              />
              : null}
          </form>
        </div>
      );
    } else {
      taskBody = (
        <StyledWordBreakDiv className="task__resolved">
          {task.type === 'free_text' ?
            <p className="task__response">
              <ParsedText text={response} />
            </p>
            : null}
          {task.type === 'geolocation' ?
            <p className="task__response">
              <GeolocationTaskResponse response={response} />
            </p>
            : null}
          {task.type === 'datetime' ?
            <p className="task__response">
              <DatetimeTaskResponse response={response} />
            </p>
            : null}
          {task.type === 'single_choice' ?
            <SingleChoiceTask
              mode="show_response"
              response={response}
              note={note}
              jsonoptions={task.jsonoptions}
            />
            : null}
          {task.type === 'multiple_choice' ?
            <MultiSelectTask
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
        </StyledWordBreakDiv>
      );
    }

    const assignedUsers = task.assigned_to ? [{ node: task.assigned_to }] : [];

    const required = this.state.required !== null ? this.state.required : task.required;

    task.project_media = Object.assign({}, this.props.media);
    delete task.project_media.tasks;

    return (
      <StyledWordBreakDiv>
        <Card
          className="task"
          style={{ marginBottom: units(1) }}
          initiallyExpanded
        >
          <CardHeader
            title={taskQuestion}
            subtitle={task.description ? task.description : null}
            id={`task__label-${task.id}`}
            showExpandableButton
          />

          <CardText expandable className="task__card-text">
            <Message message={this.state.message} />
            {taskBody}
          </CardText>

          <CardActions
            expandable
            style={
              {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                minHeight: units(6),
              }
            }
          >
            {taskActions}
          </CardActions>
          <TaskLog task={task} />
        </Card>

        <Dialog
          actions={editQuestionActions}
          modal={false}
          open={!!this.state.editingQuestion}
          onRequestClose={this.handleCancelQuestionEdit.bind(this)}
        >
          <Message message={this.state.message} />
          <form name={`edit-task-${task.dbid}`}>
            <TextField
              name="label"
              floatingLabelText={
                <FormattedMessage id="tasks.taskLabel" defaultMessage="Task label" />
              }
              defaultValue={task.label}
              onChange={this.handleQuestionEdit.bind(this)}
              fullWidth
              multiLine
            />

            <Checkbox
              label={
                <FormattedMessage
                  id="tasks.requiredCheckbox"
                  defaultMessage="Required"
                />
              }
              checked={required}
              onCheck={this.handleSelectRequired.bind(this)}
            />

            <TextField
              name="description"
              floatingLabelText={
                <FormattedMessage id="tasks.description" defaultMessage="Description" />
              }
              defaultValue={task.description}
              onChange={this.handleQuestionEdit.bind(this)}
              fullWidth
              multiLine
            />
            <h2 style={{ marginTop: units(2) }}><FormattedMessage id="tasks.assignment" defaultMessage="Assignment" /></h2>
            <Attribution
              multi={false}
              selectedUsers={assignedUsers}
              onChange={this.assignmentChanged.bind(this)}
              id={task.dbid}
              taskType={task.type}
            />
          </form>
        </Dialog>

        <Dialog
          actions={editAttributionActions}
          modal={false}
          open={!!this.state.editingAttribution}
          onRequestClose={this.handleCancelAttributionEdit.bind(this)}
          autoScrollBodyContent
        >
          <Message message={this.state.message} />
          <h2><FormattedMessage id="tasks.editAttribution" defaultMessage="Edit attribution" /></h2>
          <p style={{ marginBottom: units(2), marginTop: units(2) }}>
            <FormattedMessage id="tasks.attributionSlogan" defaultMessage='For the task, "{label}"' values={{ label: task.label }} />
          </p>
          { this.state.editingAttribution ?
            <Attribution
              id={task.dbid}
              multi
              selectedUsers={task.first_response.attribution.edges}
            />
            : null }
        </Dialog>
      </StyledWordBreakDiv>
    );
  }
}

Task.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

export default injectIntl(Task);

export { RequiredIndicator };
