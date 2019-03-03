import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import { Card, CardHeader, CardActions, CardText } from 'material-ui/Card';
import EditIcon from '@material-ui/icons/Edit';
import styled from 'styled-components';
import rtlDetect from 'rtl-detect';
import EditTaskDialog from './EditTaskDialog';
import TaskActions from './TaskActions';
import TaskLog from './TaskLog';
import SingleChoiceTask from './SingleChoiceTask';
import MultiSelectTask from './MultiSelectTask';
import ShortTextRespondTask from './ShortTextRespondTask';
import GeolocationRespondTask from './GeolocationRespondTask';
import GeolocationTaskResponse from './GeolocationTaskResponse';
import DatetimeRespondTask from './DatetimeRespondTask';
import DatetimeTaskResponse from './DatetimeTaskResponse';
import Message from '../Message';
import Can, { can } from '../Can';
import ParsedText from '../ParsedText';
import UserAvatars from '../UserAvatars';
import Sentence from '../Sentence';
import ProfileLink from '../layout/ProfileLink';
import AttributionDialog from '../user/AttributionDialog';
import CheckContext from '../../CheckContext';
import { safelyParseJSON } from '../../helpers';
import UpdateTaskMutation from '../../relay/mutations/UpdateTaskMutation';
import UpdateDynamicMutation from '../../relay/mutations/UpdateDynamicMutation';
import DeleteAnnotationMutation from '../../relay/mutations/DeleteAnnotationMutation';
import { Row, units, black16, title1 } from '../../styles/js/shared';


const StyledWordBreakDiv = styled.div`
  hyphens: auto;
  overflow-wrap: break-word;
  word-break: break-word;

  .task__card-text {
    padding-bottom: 0 !important;
    padding-top: 0 !important;
  }
`;

const messages = defineMessages({
  confirmDelete: {
    id: 'task.confirmDelete',
    defaultMessage: 'Are you sure you want to delete this task?',
  },
});

const StyledTaskResponses = styled.div`
  .task__resolved {
    border-bottom: 1px solid ${black16};
    padding-bottom: ${units(1)};
    margin-bottom: ${units(1)};
  }
`;

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
      editingAttribution: false,
    };
  }

  getAssignment() {
    const assignment = document.getElementById(`attribution-${this.props.task.dbid}`);
    if (assignment) {
      return assignment.value;
    }
    return null;
  }

  getCurrentUser() {
    return new CheckContext(this).getContextStore().currentUser;
  }

  getResponseData(response) {
    const data = {};
    const { media } = this.props;

    if (response) {
      data.by = [];
      data.byPictures = [];
      response.attribution.edges.forEach((user) => {
        const u = user.node;
        data.by.push(<ProfileLink user={u} team={media.team} />);
        data.byPictures.push(u);
      });
      const fields = JSON.parse(response.content);
      if (Array.isArray(fields)) {
        fields.forEach((field) => {
          if (/^response_/.test(field.field_name) && field.value && field.value !== '') {
            data.response = field.value;
          }
        });
      }
    }

    return data;
  }

  fail = (transaction) => {
    const error = transaction.getError();
    let message = error.source;
    const json = safelyParseJSON(error.source);
    if (json && json.error) {
      message = json.error;
    }
    this.setState({ message });
  };

  handleAction = (action, value) => {
    switch (action) {
    case 'edit_question':
      this.setState({ editingQuestion: true });
      break;
    case 'edit_response':
      this.setState({ editingResponse: value });
      break;
    case 'edit_assignment':
      this.setState({ editingAssignment: true });
      break;
    case 'edit_attribution':
      this.setState({ editingAttribution: true });
      break;
    case 'delete':
      this.handleDelete();
      break;
    default:
    }
  };

  handleCancelEditResponse = () => this.setState({ editingResponse: false });

  handleSubmitResponse = (response) => {
    const { media, task } = this.props;

    const onSuccess = () => {
      this.setState({ message: null });
    };

    const fields = {};
    fields[`response_${task.type}`] = response;

    Relay.Store.commitUpdate(
      new UpdateTaskMutation({
        operation: 'answer',
        annotated: media,
        task: {
          id: task.id,
          fields,
          annotation_type: `task_response_${task.type}`,
        },
      }),
      { onSuccess, onFailure: this.fail },
    );
  };

  handleUpdateResponse = (edited_response) => {
    const { media, task } = this.props;

    const onSuccess = () => this.setState({ message: null, editingResponse: false });

    const fields = {};
    fields[`response_${task.type}`] = edited_response;

    Relay.Store.commitUpdate(
      new UpdateDynamicMutation({
        annotated: media,
        parent_type: 'project_media',
        dynamic: {
          id: this.state.editingResponse.id,
          fields,
        },
      }),
      { onSuccess, onFailure: this.fail },
    );
  };

  handleUpdateTask = (editedTask) => {
    const { media, task } = this.props;

    const onSuccess = () => {
      this.setState({ message: null, editingQuestion: false });
    };

    const taskObj = {
      id: task.id,
      label: editedTask.label,
      required: editedTask.required,
      description: editedTask.description,
      assigned_to_ids: this.getAssignment(),
    };

    Relay.Store.commitUpdate(
      new UpdateTaskMutation({
        operation: 'update',
        annotated: media,
        task: taskObj,
      }),
      { onSuccess, onFailure: this.fail },
    );
  };

  handleUpdateAssignment = (value) => {
    const { task } = this.props;
    task.assigned_to_ids = value;

    const onSuccess = () => this.setState({ message: null, editingAssignment: false });

    Relay.Store.commitUpdate(
      new UpdateTaskMutation({
        operation: 'assign',
        annotated: this.props.media,
        task,
      }),
      { onSuccess, onFailure: this.fail },
    );
  };

  handleUpdateAttribution = (value) => {
    const onSuccess = () => this.setState({ message: null, editingAttribution: false });

    Relay.Store.commitUpdate(
      new UpdateDynamicMutation({
        annotated: this.props.media,
        parent_type: 'project_media',
        dynamic: {
          id: this.props.task.first_response.id,
          set_attribution: value,
        },
      }),
      { onSuccess, onFailure: this.fail },
    );
  };

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

  renderTaskResponse(responseObj, response, by, byPictures, showEditIcon) {
    const { task } = this.props;

    if (this.state.editingResponse && this.state.editingResponse.id === responseObj.id) {
      const editingResponseData = this.getResponseData(this.state.editingResponse);
      const editingResponseText = editingResponseData.response;
      return (
        <div className="task__editing">
          <form name={`edit-response-${this.state.editingResponse.id}`}>
            {task.type === 'free_text' ?
              <ShortTextRespondTask
                response={editingResponseText}
                onSubmit={this.handleUpdateResponse}
                onDismiss={this.handleCancelEditResponse}
              />
              : null}
            {task.type === 'geolocation' ?
              <GeolocationRespondTask
                response={editingResponseText}
                onSubmit={this.handleUpdateResponse}
                onDismiss={this.handleCancelEditResponse}
              />
              : null}
            {task.type === 'datetime' ?
              <DatetimeRespondTask
                response={editingResponseText}
                onSubmit={this.handleUpdateResponse}
                onDismiss={this.handleCancelEditResponse}
              />
              : null}
            {task.type === 'single_choice' ?
              <SingleChoiceTask
                mode="edit_response"
                response={editingResponseText}
                jsonoptions={task.jsonoptions}
                onDismiss={this.handleCancelEditResponse}
                onSubmit={this.handleUpdateResponse}
              />
              : null}
            {task.type === 'multiple_choice' ?
              <MultiSelectTask
                mode="edit_response"
                jsonresponse={editingResponseText}
                jsonoptions={task.jsonoptions}
                onDismiss={this.handleCancelEditResponse}
                onSubmit={this.handleUpdateResponse}
              />
              : null}
          </form>
        </div>
      );
    }
    const resolverStyle = {
      display: 'flex',
      alignItems: 'center',
      marginTop: units(1),
      justifyContent: 'space-between',
    };
    return (
      <StyledWordBreakDiv className="task__resolved">
        {task.type === 'free_text' ?
          <div className="task__response">
            <ParsedText text={response} />
          </div>
          : null}
        {task.type === 'geolocation' ?
          <div className="task__response">
            <GeolocationTaskResponse response={response} />
          </div>
          : null}
        {task.type === 'datetime' ?
          <div className="task__response">
            <DatetimeTaskResponse response={response} />
          </div>
          : null}
        {task.type === 'single_choice' ?
          <SingleChoiceTask
            mode="show_response"
            response={response}
            jsonoptions={task.jsonoptions}
          />
          : null}
        {task.type === 'multiple_choice' ?
          <MultiSelectTask
            mode="show_response"
            jsonresponse={response}
            jsonoptions={task.jsonoptions}
          />
          : null}
        { (by && byPictures) ?
          <div className="task__resolver" style={resolverStyle}>
            <small style={{ display: 'flex' }}>
              <UserAvatars users={byPictures} />
              <span style={{ lineHeight: '24px', paddingLeft: units(1), paddingRight: units(1) }}>
                <FormattedMessage
                  id="task.answeredBy"
                  defaultMessage="Answered by {byName}"
                  values={{ byName: <Sentence list={by} /> }}
                />
              </span>
            </small>
            { showEditIcon && can(responseObj.permissions, 'update Dynamic') ?
              <EditIcon
                style={{ width: 16, height: 16, cursor: 'pointer' }}
                onClick={() => this.handleAction('edit_response', responseObj)}
              /> : null }
          </div> : null }
      </StyledWordBreakDiv>
    );
  }

  render() {
    const { task, media } = this.props;
    const data = this.getResponseData(task.first_response);
    const {
      response, by, byPictures,
    } = data;
    const currentUser = this.getCurrentUser();

    task.cannotAct = (!response && !can(media.permissions, 'create Task') && !can(task.permissions, 'destroy Task'));

    let taskAssigned = false;
    const taskAnswered = !!response;

    const assignments = task.assignments.edges;
    const assignmentComponents = [];
    assignments.forEach((assignment) => {
      assignmentComponents.push(<ProfileLink user={assignment.node} team={media.team} />);
      if (currentUser && assignment.node.dbid === currentUser.dbid) {
        taskAssigned = true;
      }
    });

    const isRtl = rtlDetect.isRtlLang(this.props.intl.locale);

    const direction = {
      from: isRtl ? 'right' : 'left',
      to: isRtl ? 'left' : 'right',
    };

    const taskAssignment = task.assignments.edges.length > 0 && !response ? (
      <div className="task__assigned" style={{ display: 'flex', alignItems: 'center', width: 420 }}>
        <small style={{ display: 'flex' }}>
          <UserAvatars users={assignments} />
          <span style={{ lineHeight: '24px', paddingLeft: units(1), paddingRight: units(1) }}>
            <FormattedMessage
              id="task.assignedTo"
              defaultMessage="Assigned to {name}"
              values={{
                name: <Sentence list={assignmentComponents} />,
              }}
            />
          </span>
        </small>
      </div>
    ) : null;

    const taskActionsStyle = {
      marginLeft: 'auto',
      position: 'absolute',
      bottom: '0',
    };
    taskActionsStyle[direction.to] = units(0.5);

    const taskActions = !media.archived ? (
      <div>
        {taskAssignment}
        {data.by ?
          <div className="task__resolver" style={{ display: 'flex', alignItems: 'center', marginTop: units(1) }}>
            <small style={{ display: 'flex' }}>
              <UserAvatars users={byPictures} />
              <span style={{ lineHeight: '24px', paddingLeft: units(1), paddingRight: units(1) }}>
                { task.status === 'resolved' ?
                  <FormattedMessage
                    id="task.resolvedBy"
                    defaultMessage="Resolved by {byName}"
                    values={{ byName: <Sentence list={by} /> }}
                  /> : null }
                { task.status === 'unresolved' && response ?
                  <FormattedMessage
                    id="task.answeredBy"
                    defaultMessage="Answered by {byName}"
                    values={{ byName: <Sentence list={by} /> }}
                  /> : null }
              </span>
            </small>
          </div>
          : null}
        <div style={taskActionsStyle}>
          <TaskActions task={task} media={media} response={response} onSelect={this.handleAction} />
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
    if ((!response || task.responses.edges.length > 1) && !media.archived) {
      taskBody = (
        <div>
          <StyledTaskResponses>
            {task.responses.edges.map((singleResponse) => {
              const singleResponseData = this.getResponseData(singleResponse.node);
              return this.renderTaskResponse(
                singleResponse.node,
                singleResponseData.response,
                singleResponseData.by,
                singleResponseData.byPictures,
                true,
              );
            })}
          </StyledTaskResponses>
          {task.status === 'unresolved' ?
            <Can permissions={media.permissions} permission="create Dynamic">
              <div>
                <form name={`task-response-${task.id}`}>

                  <div className="task__response-inputs">
                    {task.type === 'free_text' ?
                      <ShortTextRespondTask
                        onSubmit={this.handleSubmitResponse}
                      />
                      : null}
                    {task.type === 'geolocation' ?
                      <GeolocationRespondTask
                        onSubmit={this.handleSubmitResponse}
                      /> : null}
                    {task.type === 'datetime' ?
                      <DatetimeRespondTask onSubmit={this.handleSubmitResponse} />
                      : null}
                    {task.type === 'single_choice' ?
                      <SingleChoiceTask
                        mode="respond"
                        response={response}
                        jsonoptions={task.jsonoptions}
                        onSubmit={this.handleSubmitResponse}
                      />
                      : null}
                    {task.type === 'multiple_choice' ?
                      <MultiSelectTask
                        mode="respond"
                        jsonresponse={response}
                        jsonoptions={task.jsonoptions}
                        onSubmit={this.handleSubmitResponse}
                      />
                      : null}
                  </div>
                </form>
              </div>
            </Can> : null}
        </div>
      );
    } else {
      taskBody = this.renderTaskResponse(task.first_response, response, false, false, false);
    }

    task.project_media = Object.assign({}, this.props.media);
    delete task.project_media.tasks;

    const taskDescription = task.description ?
      <ParsedText text={task.description} />
      : null;

    const className = ['task'];
    if (taskAnswered) {
      className.push('task__answered-by-current-user');
    }
    if (taskAssigned) {
      className.push('task__assigned-to-current-user');
    }
    if (task.required) {
      className.push('task__required');
    }

    return (
      <StyledWordBreakDiv>
        <Card
          className={className.join(' ')}
          style={{ marginBottom: units(1) }}
          initiallyExpanded
        >
          <CardHeader
            title={taskQuestion}
            subtitle={taskDescription}
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

        { this.state.editingQuestion ?
          <EditTaskDialog
            task={task}
            message={this.state.message}
            taskType={task.type}
            onDismiss={() => this.setState({ editingQuestion: false })}
            onSubmit={this.handleUpdateTask}
            noOptions
          />
          : null
        }

        { this.state.editingAssignment ?
          <AttributionDialog
            taskType={task.type}
            open={this.state.editingAssignment}
            title={
              <FormattedMessage id="tasks.editAssignment" defaultMessage="Edit assignment" />
            }
            blurb={
              <FormattedMessage
                id="tasks.attributionSlogan"
                defaultMessage='For the task, "{label}"'
                values={{ label: task.label }}
              />
            }
            selectedUsers={assignments}
            onDismiss={() => this.setState({ editingAssignment: false })}
            onSubmit={this.handleUpdateAssignment}
          /> : null
        }

        { this.state.editingAttribution ?
          <AttributionDialog
            taskType={task.type}
            open={this.state.editingAttribution}
            title={
              <FormattedMessage id="tasks.editAttribution" defaultMessage="Edit attribution" />
            }
            blurb={
              <FormattedMessage
                id="tasks.attributionSlogan"
                defaultMessage='For the task, "{label}"'
                values={{ label: task.label }}
              />
            }
            selectedUsers={task.first_response.attribution.edges}
            onDismiss={() => this.setState({ editingAttribution: false })}
            onSubmit={this.handleUpdateAttribution}
          /> : null
        }
      </StyledWordBreakDiv>
    );
  }
}

Task.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

Task.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(Task);
export { RequiredIndicator };
