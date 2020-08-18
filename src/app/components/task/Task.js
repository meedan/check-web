import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import IconButton from '@material-ui/core/IconButton';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Collapse from '@material-ui/core/Collapse';
import EditIcon from '@material-ui/icons/Edit';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import styled from 'styled-components';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
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
import ImageUploadRespondTask from './ImageUploadRespondTask';
import Message from '../Message';
import Can, { can } from '../Can';
import ParsedText from '../ParsedText';
import UserAvatars from '../UserAvatars';
import Sentence from '../Sentence';
import ProfileLink from '../layout/ProfileLink';
import AttributionDialog from '../user/AttributionDialog';
import CheckContext from '../../CheckContext';
import { getErrorMessage } from '../../helpers';
import { stringHelper } from '../../customHelpers';
import globalStrings from '../../globalStrings';
import UpdateTaskMutation from '../../relay/mutations/UpdateTaskMutation';
import UpdateDynamicMutation from '../../relay/mutations/UpdateDynamicMutation';
import DeleteAnnotationMutation from '../../relay/mutations/DeleteAnnotationMutation';
import DeleteDynamicMutation from '../../relay/mutations/DeleteDynamicMutation';
import { Row, units, black16, black87 } from '../../styles/js/shared';

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
  confirmDeleteResponse: {
    id: 'task.confirmDeleteResponse',
    defaultMessage: 'Are you sure you want to delete this task answer?',
  },
});

const StyledTaskTitle = styled.span`
  line-height: ${units(3)};
  font-weight: 500;
  color: ${black87};
`;

const StyledTaskResponses = styled.div`
  .task__resolved {
    border-bottom: 1px solid ${black16};
    padding-bottom: ${units(1)};
    margin-bottom: ${units(1)};
  }
`;

function getResponseData(response) {
  const data = {};

  if (response) {
    data.by = [];
    data.byPictures = [];
    response.attribution.edges.forEach((user) => {
      const u = user.node;
      data.by.push(<ProfileLink teamUser={u.team_user} />);
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

/* eslint jsx-a11y/click-events-have-key-events: 0 */
class Task extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editingQuestion: false,
      message: null,
      editingResponse: false,
      editingAttribution: false,
      expand: false,
      zoomedImage: null,
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

  fail = (transaction) => {
    const fallbackMessage = this.props.intl.formatMessage(globalStrings.unknownError, { supportEmail: stringHelper('SUPPORT_EMAIL') });
    const message = getErrorMessage(transaction, fallbackMessage);
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
    case 'delete_response':
      this.handleDeleteResponse(value);
      break;
    default:
    }
  };

  handleCancelEditResponse = () => this.setState({ editingResponse: false });

  handleSubmitResponse = (response, file) => {
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
        file,
        user: this.getCurrentUser(),
        task: {
          id: task.id,
          fields,
          annotation_type: `task_response_${task.type}`,
        },
      }),
      { onSuccess, onFailure: this.fail },
    );
  };

  handleUpdateResponse = (edited_response, file) => {
    const { media, task } = this.props;

    const onSuccess = () => this.setState({ message: null, editingResponse: false });

    const onFailure = (transaction) => {
      this.setState({ editingResponse: true });
      this.fail(transaction);
    };

    const fields = {};
    fields[`response_${task.type}`] = edited_response;

    Relay.Store.commitUpdate(
      new UpdateDynamicMutation({
        annotated: media,
        task,
        parent_type: 'task',
        file,
        dynamic: {
          id: this.state.editingResponse.id,
          fields,
        },
      }),
      { onSuccess, onFailure },
    );

    this.setState({ message: null, editingResponse: false });
  };

  handleUpdateTask = (editedTask) => {
    const { media, task } = this.props;

    const onSuccess = () => {
      this.setState({ message: null, editingQuestion: false });
    };

    const onFailure = (transaction) => {
      this.setState({ editingQuestion: true });
      this.fail(transaction);
    };

    const taskObj = {
      id: task.id,
      label: editedTask.label,
      json_schema: editedTask.jsonschema,
      description: editedTask.description,
      assigned_to_ids: this.getAssignment(),
    };

    Relay.Store.commitUpdate(
      new UpdateTaskMutation({
        operation: 'update',
        annotated: media,
        user: this.getCurrentUser(),
        task: taskObj,
      }),
      { onSuccess, onFailure },
    );

    this.setState({ message: null, editingQuestion: false });
  };

  handleUpdateAssignment = (value) => {
    const { task } = this.props;
    task.assigned_to_ids = value;

    const onSuccess = () => this.setState({ message: null, editingAssignment: false });

    Relay.Store.commitUpdate(
      new UpdateTaskMutation({
        operation: 'assign',
        user: this.getCurrentUser(),
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

  handleDeleteResponse(response) {
    const { task } = this.props;

    // eslint-disable-next-line no-alert
    if (window.confirm(this.props.intl.formatMessage(messages.confirmDeleteResponse))) {
      Relay.Store.commitUpdate(new DeleteDynamicMutation({
        parent_type: 'task',
        annotated: task,
        id: response.id,
      }));
    }
  }

  handleCloseImage() {
    this.setState({ zoomedImage: false });
  }

  handleOpenImage(image) {
    this.setState({ zoomedImage: image });
  }

  renderTaskResponse(responseObj, response, by, byPictures, showEditIcon) {
    const { task } = this.props;
    const isTask = task.fieldset === 'tasks';

    if (this.state.editingResponse && this.state.editingResponse.id === responseObj.id) {
      const editingResponseData = getResponseData(this.state.editingResponse);
      const editingResponseText = editingResponseData.response;
      return (
        <div className="task__editing">
          <form name={`edit-response-${this.state.editingResponse.id}`}>
            {task.type === 'free_text' ?
              <ShortTextRespondTask
                fieldset={task.fieldset}
                task={task}
                response={editingResponseText}
                onSubmit={this.handleUpdateResponse}
                onDismiss={this.handleCancelEditResponse}
              />
              : null}
            {task.type === 'geolocation' ?
              <GeolocationRespondTask
                fieldset={task.fieldset}
                response={editingResponseText}
                onSubmit={this.handleUpdateResponse}
                onDismiss={this.handleCancelEditResponse}
              />
              : null}
            {task.type === 'datetime' ?
              <DatetimeRespondTask
                fieldset={task.fieldset}
                response={editingResponseText}
                onSubmit={this.handleUpdateResponse}
                onDismiss={this.handleCancelEditResponse}
              />
              : null}
            {task.type === 'single_choice' ?
              <SingleChoiceTask
                fieldset={task.fieldset}
                mode="edit_response"
                response={editingResponseText}
                jsonoptions={task.jsonoptions}
                onDismiss={this.handleCancelEditResponse}
                onSubmit={this.handleUpdateResponse}
              />
              : null}
            {task.type === 'multiple_choice' ?
              <MultiSelectTask
                fieldset={task.fieldset}
                mode="edit_response"
                jsonresponse={editingResponseText}
                jsonoptions={task.jsonoptions}
                onDismiss={this.handleCancelEditResponse}
                onSubmit={this.handleUpdateResponse}
              />
              : null}
            {task.type === 'image_upload' ?
              <ImageUploadRespondTask
                fieldset={task.fieldset}
                task={task}
                response={editingResponseText}
                onSubmit={this.handleUpdateResponse}
                onDismiss={this.handleCancelEditResponse}
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
    let imageUploadPath = null;
    if (task.type === 'image_upload' && responseObj.image_data && responseObj.image_data.length) {
      [imageUploadPath] = responseObj.image_data;
    }
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
        {task.type === 'image_upload' ?
          <div className="task__response">
            <div onClick={this.handleOpenImage.bind(this, imageUploadPath)}>
              <div style={{ textAlign: 'center', cursor: 'pointer' }}>
                <img
                  src={imageUploadPath}
                  className="task__response-thumbnail"
                  alt=""
                  style={{
                    height: 'auto',
                    maxWidth: 300,
                    maxHeight: 300,
                  }}
                />
                <p style={{ textAlign: 'center' }}><small>{response}</small></p>
              </div>
              {this.state.zoomedImage
                ? <Lightbox
                  onCloseRequest={this.handleCloseImage.bind(this)}
                  mainSrc={this.state.zoomedImage}
                />
                : null}
            </div>
          </div>
          : null}
        { by && byPictures && isTask ?
          <div className="task__resolver" style={resolverStyle}>
            <small style={{ display: 'flex' }}>
              <UserAvatars users={byPictures} />
              <span style={{ lineHeight: '24px', paddingLeft: units(1), paddingRight: units(1) }}>
                <FormattedMessage
                  id="task.answeredBy"
                  defaultMessage="Completed by {byName}"
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
    const isTask = task.fieldset === 'tasks';
    const data = getResponseData(task.first_response);
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
      assignmentComponents.push(<ProfileLink user={assignment.node.team_user} />);
      if (currentUser && assignment.node.dbid === currentUser.dbid) {
        taskAssigned = true;
      }
    });

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
      textAlign: 'end',
    };

    const zeroAnswer = task.responses.edges.length === 0;

    const taskActions = !media.archived ? (
      <div>
        {taskAssignment}
        { data.by && isTask ?
          <div className="task__resolver" style={{ display: 'flex', alignItems: 'center', marginTop: units(1) }}>
            <small style={{ display: 'flex' }}>
              <UserAvatars users={byPictures} />
              <span style={{ lineHeight: '24px', paddingLeft: units(1), paddingRight: units(1) }}>
                { response ?
                  <FormattedMessage
                    id="task.answeredBy"
                    defaultMessage="Completed by {byName}"
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
            <StyledTaskTitle className="task__label">
              {task.label}
            </StyledTaskTitle>
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
              const singleResponseData = getResponseData(singleResponse.node);
              return this.renderTaskResponse(
                singleResponse.node,
                singleResponseData.response,
                singleResponseData.by,
                singleResponseData.byPictures,
                true,
              );
            })}
          </StyledTaskResponses>
          {zeroAnswer ?
            <Can permissions={media.permissions} permission="create Dynamic">
              <div>
                <form name={`task-response-${task.id}`}>

                  <div className="task__response-inputs">
                    {task.type === 'free_text' ?
                      <ShortTextRespondTask
                        task={task}
                        fieldset={task.fieldset}
                        onSubmit={this.handleSubmitResponse}
                      />
                      : null}
                    {task.type === 'geolocation' ?
                      <GeolocationRespondTask
                        fieldset={task.fieldset}
                        onSubmit={this.handleSubmitResponse}
                      /> : null}
                    {task.type === 'datetime' ?
                      <DatetimeRespondTask
                        fieldset={task.fieldset}
                        onSubmit={this.handleSubmitResponse}
                      />
                      : null}
                    {task.type === 'single_choice' ?
                      <SingleChoiceTask
                        fieldset={task.fieldset}
                        mode="respond"
                        response={response}
                        jsonoptions={task.jsonoptions}
                        onSubmit={this.handleSubmitResponse}
                      />
                      : null}
                    {task.type === 'multiple_choice' ?
                      <MultiSelectTask
                        fieldset={task.fieldset}
                        mode="respond"
                        jsonresponse={response}
                        jsonoptions={task.jsonoptions}
                        onSubmit={this.handleSubmitResponse}
                      />
                      : null}
                    {task.type === 'image_upload' ?
                      <ImageUploadRespondTask
                        fieldset={task.fieldset}
                        task={task}
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

    const className = ['task', `task-type__${task.type}`];
    if (taskAnswered) {
      className.push('task__answered-by-current-user');
    }
    if (taskAssigned) {
      className.push('task__assigned-to-current-user');
    }

    return (
      <StyledWordBreakDiv>
        <Card
          id={`task-${task.dbid}`}
          className={className.join(' ')}
          style={{ marginBottom: units(1) }}
        >
          <CardHeader
            disableTypography
            title={taskQuestion}
            subheader={taskDescription}
            id={`task__label-${task.id}`}
            action={
              <IconButton
                className="task__card-expand"
                onClick={() => this.setState({ expand: !this.state.expand })}
              >
                <KeyboardArrowDown />
              </IconButton>
            }
          />
          <Collapse in={this.state.expand} timeout="auto">
            <CardContent className="task__card-text">
              <Message message={this.state.message} />
              {taskBody}
            </CardContent>
            <div style={{ minHeight: units(6) }} />
            {taskActions}
            { isTask ?
              <TaskLog task={task} response={response} /> : null
            }
          </Collapse>
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

Task.contextTypes = {
  store: PropTypes.object,
};

export default Relay.createContainer(injectIntl(Task), {
  initialVariables: {
    teamSlug: null,
  },
  prepareVariables: vars => ({
    ...vars,
    teamSlug: /^\/([^/]+)/.test(window.location.pathname) ? window.location.pathname.match(/^\/([^/]+)/)[1] : null,
  }),
  fragments: {
    task: () => Relay.QL`
      fragment on Task {
        id,
        dbid,
        label,
        type,
        description,
        fieldset,
        permissions,
        jsonoptions,
        json_schema,
        options,
        pending_suggestions_count,
        suggestions_count,
        log_count,
        responses(first: 10000) {
          edges {
            node {
              id,
              dbid,
              permissions,
              content,
              image_data,
              attribution(first: 10000) {
                edges {
                  node {
                    id
                    dbid
                    name
                    team_user(team_slug: $teamSlug) {
                      ${ProfileLink.getFragment('teamUser')},
                    },
                    source {
                      id
                      dbid
                      image
                    }
                  }
                }
              }
              annotator {
                name,
                profile_image,
                user {
                  id,
                  dbid,
                  name,
                  is_active
                  team_user(team_slug: $teamSlug) {
                    ${ProfileLink.getFragment('teamUser')},
                  },
                  source {
                    id,
                    dbid,
                    image,
                  }
                }
              }
            }
          }
        }
        assignments(first: 10000) {
          edges {
            node {
              name
              id
              dbid
              team_user(team_slug: $teamSlug) {
                ${ProfileLink.getFragment('teamUser')},
              },
              source {
                id
                dbid
                image
              }
            }
          }
        }
        first_response {
          id,
          dbid,
          permissions,
          content,
          image_data,
          attribution(first: 10000) {
            edges {
              node {
                id
                dbid
                name
                team_user(team_slug: $teamSlug) {
                  ${ProfileLink.getFragment('teamUser')},
                },
                source {
                  id
                  dbid
                  image
                }
              }
            }
          }
          annotator {
            name,
            profile_image,
            user {
              id,
              dbid,
              name,
              is_active
              team_user(team_slug: $teamSlug) {
                ${ProfileLink.getFragment('teamUser')},
              },
              source {
                id,
                dbid,
                image,
              }
            }
          }
        }
      }
    `,
  },
});
