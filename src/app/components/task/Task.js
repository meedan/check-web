import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Collapse from '@material-ui/core/Collapse';
import Typography from '@material-ui/core/Typography';
import EditIcon from '@material-ui/icons/Edit';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import CircularProgress from '@material-ui/core/CircularProgress';
import styled from 'styled-components';
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
import FileUploadRespondTask from './FileUploadRespondTask';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import { FormattedGlobalMessage } from '../MappedMessage';
import Message from '../Message';
import Can, { can } from '../Can';
import ParsedText from '../ParsedText';
import UserAvatars from '../UserAvatars';
import Sentence from '../Sentence';
import ConfirmProceedDialog from '../layout/ConfirmProceedDialog';
import ProfileLink from '../layout/ProfileLink';
import AttributionDialog from '../user/AttributionDialog';
import CheckContext from '../../CheckContext';
import { getErrorMessage } from '../../helpers';
import UpdateTaskMutation from '../../relay/mutations/UpdateTaskMutation';
import UpdateDynamicMutation from '../../relay/mutations/UpdateDynamicMutation';
import DeleteAnnotationMutation from '../../relay/mutations/DeleteAnnotationMutation';
import DeleteDynamicMutation from '../../relay/mutations/DeleteDynamicMutation';
import { Row, units, black16, black87, separationGray, checkBlue } from '../../styles/js/shared';
import CheckArchivedFlags from '../../CheckArchivedFlags';

const StyledWordBreakDiv = styled.div`
  width: 100%;
  hyphens: auto;
  overflow-wrap: break-word;
  word-break: break-word;

  .task {
    box-shadow: none;
    border-bottom: 1px solid ${separationGray};
    border-radius: 0;
    margin-bottom: 0 !important;

    .task__card-header {
      padding: ${units(3)} 0;
      flex-direction: row-reverse;
      display: flex;
      align-items: flex-start;

      .task__card-expand {
        margin: ${units(0)} ${units(1)} 0 0;
      }

      .task__card-description {
        padding: ${units(2)} 0 0 0;
      }
    }
  }

  .task__card-text {
    padding-bottom: 0 !important;
    padding-top: 0 !important;
  }
`;

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
      data.by.push(<ProfileLink teamUser={u.team_user || null} />);
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
      deleteResponse: null,
      deletingTask: false,
      editingResponse: false,
      editingAttribution: false,
      expand: true,
      isSaving: false,
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
    const message = getErrorMessage(transaction, <GenericUnknownErrorMessage />);
    this.setState({ message, isSaving: false });
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
      this.setState({ deletingTask: true });
      break;
    case 'delete_response':
      this.setState({ deleteResponse: value });
      break;
    default:
    }
  };

  handleCancelEditResponse = () => this.setState({ editingResponse: false });

  handleSubmitResponse = (response, file) => {
    const { media, task } = this.props;
    this.setState({ isSaving: true });

    const onSuccess = () => {
      this.setState({ message: null, isSaving: false });
    };

    const fields = {};
    fields[`response_${task.type}`] = response;

    const parentType = task.annotated_type.replace(/([a-z])([A-Z])/, '$1_$2').toLowerCase();

    Relay.Store.commitUpdate(
      new UpdateTaskMutation({
        operation: 'answer',
        annotated: media,
        parent_type: parentType,
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
    this.setState({ isSaving: true });

    const onSuccess = () => this.setState({
      message: null,
      editingResponse: false,
      isSaving: false,
    });

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

    const parentType = task.annotated_type.replace(/([a-z])([A-Z])/, '$1_$2').toLowerCase();

    Relay.Store.commitUpdate(
      new UpdateTaskMutation({
        operation: 'update',
        annotated: media,
        parent_type: parentType,
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

    const parentType = task.annotated_type.replace(/([a-z])([A-Z])/, '$1_$2').toLowerCase();

    Relay.Store.commitUpdate(
      new UpdateTaskMutation({
        operation: 'assign',
        user: this.getCurrentUser(),
        annotated: this.props.media,
        parent_type: parentType,
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

  submitDeleteTask = () => {
    const { task, media } = this.props;
    this.setState({ isSaving: true });

    const onSuccess = () => {
      this.setState({ deletingTask: false, isSaving: false });
    };

    Relay.Store.commitUpdate(
      new DeleteAnnotationMutation({
        parent_type: 'project_media',
        annotated: media,
        id: task.id,
      }),
      { onSuccess, onFailure: this.fail },
    );
  };

  submitDeleteTaskResponse = () => {
    const { task } = this.props;
    const { deleteResponse } = this.state;
    this.setState({ isSaving: true });

    const onSuccess = () => {
      this.setState({ deleteResponse: null, isSaving: false });
    };

    Relay.Store.commitUpdate(
      new DeleteDynamicMutation({
        parent_type: 'task',
        annotated: task,
        id: deleteResponse.id,
      }),
      { onSuccess, onFailure: this.fail },
    );
  };

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
                timezones={task.jsonoptions}
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
            {task.type === 'file_upload' ?
              <FileUploadRespondTask
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
    let fileUploadPath = null;
    if (task.type === 'file_upload' && responseObj.file_data && responseObj.file_data.length) {
      [fileUploadPath] = responseObj.file_data;
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
        {task.type === 'file_upload' ?
          <div className="task__response">
            <Box component="p" textAlign="center">
              { fileUploadPath ?
                <Box
                  component="a"
                  href={fileUploadPath}
                  target="_blank"
                  rel="noreferrer noopener"
                  color={checkBlue}
                >
                  {response}
                </Box> :
                <CircularProgress /> }
            </Box>
          </div>
          : null}
        { by && byPictures && isTask ?
          <Box
            className="task__resolver"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mt={1}
          >
            <Box component="small" display="flex">
              <UserAvatars users={byPictures} />
              <Box component="span" lineHeight="24px" px={1}>
                <FormattedMessage
                  id="task.answeredBy"
                  defaultMessage="Completed by {byName}"
                  values={{ byName: <Sentence list={by} /> }}
                />
              </Box>
            </Box>
            { showEditIcon && can(responseObj.permissions, 'update Dynamic') ?
              <EditIcon
                style={{ width: 16, height: 16, cursor: 'pointer' }}
                onClick={() => this.handleAction('edit_response', responseObj)}
              /> : null }
          </Box> : null }
      </StyledWordBreakDiv>
    );
  }

  render() {
    const { task: teamTask, media } = this.props;
    const task = { ...teamTask };
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
      assignmentComponents.push(<ProfileLink teamUser={assignment.node.team_user || null} />);
      if (currentUser && assignment.node.dbid === currentUser.dbid) {
        taskAssigned = true;
      }
    });

    const taskAssignment = task.assignments.edges.length > 0 && !response && task.fieldset === 'tasks' ? (
      <Box
        className="task__assigned"
        display="flex"
        alignItems="center"
        width="420px"
        m={2}
        justifyContent="space-between"
      >
        <Box component="small" display="flex">
          <UserAvatars users={assignments} />
          <Box component="span" lineHeight="24px" px={1}>
            <FormattedMessage
              id="task.assignedTo"
              defaultMessage="Assigned to {name}"
              values={{
                name: <Sentence list={assignmentComponents} />,
              }}
            />
          </Box>
        </Box>
      </Box>
    ) : null;

    const zeroAnswer = task.responses.edges.length === 0;

    const annotatedNotArchived = task.annotated_type === 'Source' || media.archived === CheckArchivedFlags.NONE;

    const taskActions = annotatedNotArchived ? (
      <Box display="flex" alignItems="center">
        {taskAssignment}
        { data.by && isTask ?
          <Box className="task__resolver" display="flex" alignItems="center" margin={2}>
            <Box component="small" display="flex">
              <UserAvatars users={byPictures} />
              <Box component="span" lineHeight="24px" px={1}>
                { response ?
                  <FormattedMessage
                    id="task.answeredBy"
                    defaultMessage="Completed by {byName}"
                    values={{ byName: <Sentence list={by} /> }}
                  /> : null }
              </Box>
            </Box>
          </Box>
          : null}
        <Box marginLeft="auto">
          <TaskActions task={task} media={media} response={response} onSelect={this.handleAction} />
        </Box>
      </Box>
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
    if ((!response || task.responses.edges.length > 1)
      && annotatedNotArchived) {
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
                        timezones={task.jsonoptions}
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
                    {task.type === 'file_upload' ?
                      <FileUploadRespondTask
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

    const taskDescription = task.description ? (
      <div className="task__card-description">
        <ParsedText text={task.description} />
      </div>
    ) : null;

    const className = ['task', `task-type__${task.type}`];
    if (taskAnswered) {
      className.push('task__answered-by-current-user');
    }
    if (taskAssigned) {
      className.push('task__assigned-to-current-user');
    }

    return ( // Task cards
      <StyledWordBreakDiv>
        <Box clone mb={1}>
          <Card
            id={`task-${task.dbid}`}
            className={className.join(' ')}
            style={{ marginBottom: units(1) }}
          >
            <CardHeader
              className="task__card-header"
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
                <Box marginBottom={2}>
                  {taskBody}
                </Box>
              </CardContent>
              {taskActions}
              { isTask ?
                <TaskLog task={task} response={response} /> : null
              }
            </Collapse>
          </Card>
        </Box>

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

        <ConfirmProceedDialog
          body={
            <Typography variant="body1" component="p">
              <FormattedMessage
                id="task.confirmDelete"
                defaultMessage="Are you sure you want to delete this task?"
              />
            </Typography>
          }
          isSaving={this.state.isSaving}
          onCancel={() => this.setState({ deletingTask: false })}
          onProceed={this.submitDeleteTask}
          open={this.state.deletingTask}
          proceedLabel={<FormattedGlobalMessage messageKey="delete" />}
          title={<FormattedMessage id="task.confirmDeleteTitle" defaultMessage="Delete task?" />}
        />

        <ConfirmProceedDialog
          body={
            <Typography variant="body1" component="p">
              <FormattedMessage
                id="task.confirmDeleteResponse"
                defaultMessage="Are you sure you want to delete this answer?"
              />
            </Typography>
          }
          isSaving={this.state.isSaving}
          onCancel={() => this.setState({ deleteResponse: null })}
          onProceed={this.submitDeleteTaskResponse}
          open={this.state.deleteResponse}
          proceedLabel={<FormattedGlobalMessage messageKey="delete" />}
          title={<FormattedMessage id="task.confirmDeleteResponseTitle" defaultMessage="Delete answer?" />}
        />
      </StyledWordBreakDiv>
    );
  }
}

Task.contextTypes = {
  store: PropTypes.object,
};

export default Relay.createContainer(Task, {
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
        annotated_type
        description,
        fieldset,
        permissions,
        jsonoptions,
        json_schema,
        options,
        pending_suggestions_count,
        suggestions_count,
        log_count,
        team_task_id,
        responses(first: 10000) {
          edges {
            node {
              id,
              dbid,
              permissions,
              content,
              file_data,
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
          file_data,
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
