import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Collapse from '@material-ui/core/Collapse';
import Typography from '@material-ui/core/Typography';
import EditIcon from '@material-ui/icons/Edit';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import CircularProgress from '@material-ui/core/CircularProgress';
import { MetadataText, MetadataFile, MetadataDate, MetadataNumber, MetadataLocation, MetadataMultiselect } from '@meedan/check-ui';
import styled from 'styled-components';
import moment from 'moment';
import EditTaskDialog from './EditTaskDialog';
import TaskActions from './TaskActions';
import TaskLog from './TaskLog';
import SingleChoiceTask from './SingleChoiceTask';
import MultiSelectTask from './MultiSelectTask';
import ShortTextRespondTask from './ShortTextRespondTask';
import NumberRespondTask from './NumberRespondTask';
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
import {
  Row,
  units,
  black16,
  black87,
  separationGray,
  checkBlue,
} from '../../styles/js/shared';
import CheckArchivedFlags from '../../CheckArchivedFlags';

const StyledWordBreakDiv = styled.div`
  width: 100%;
  hyphens: auto;
  overflow-wrap: break-word;
  word-break: break-word;

  .task {
    box-shadow: none;
    border: 0;
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

const StyledAnnotatorInformation = styled.span`
  display: inline-block;
  p {
    font-size: 9px;
    color: #979797;
  }
`;

const StyledRequired = styled.span`
  color: red;
`;

const StyledMapEditor = styled.div`
  #map-edit {
    width: 100%;
    height: 500px;
  }
`;

const StyledMultiselect = styled.div`
  .Mui-checked + .MuiFormControlLabel-label.Mui-disabled {
    color: black;
  }
  .Mui-checked {
    color: ${checkBlue} !important;
  }
`;

const StyledFieldInformation = styled.div`
  margin-bottom: ${units(2)};
`;

const StyledMetadataButton = styled.div`
  button {
    background-color: #f4f4f4;
    margin-top: ${units(1)};
    display: none;
  }
  button:hover {
    background-color: #ddd;
  }
`;

function getResponseData(response) {
  const data = {};

  if (response) {
    data.by = [];
    data.byPictures = [];
    if (response.attribution) {
      response.attribution.edges.forEach((user) => {
        const u = user.node;
        data.by.push(<ProfileLink teamUser={u.team_user || null} />);
        data.byPictures.push(u);
      });
    }
    if (response.content) {
      const fields = JSON.parse(response.content);
      if (Array.isArray(fields)) {
        fields.forEach((field) => {
          if (
            /^response_/.test(field.field_name) &&
            field.value &&
            field.value !== ''
          ) {
            data.response = field.value;
          }
        });
      }
    }
  }

  return data;
}

/* eslint jsx-a11y/click-events-have-key-events: 0 */
class Task extends Component {
  constructor(props) {
    super(props);

    let textValue;
    if (props.task.type === 'multiple_choice' || props.task.type === 'single_choice') {
      textValue = this.getMultiselectInitialValue(props.task);
    } else {
      textValue = props.task.first_response_value;
    }

    this.state = {
      editingQuestion: false,
      message: null,
      deleteResponse: null,
      deletingTask: false,
      editingResponse: false,
      editingAttribution: false,
      expand: true,
      isSaving: false,
      textValue,
    };
  }

  getMultiselectInitialValue = (node) => {
    let initialDynamic;
    try {
      if (node.type === 'multiple_choice') {
        initialDynamic = JSON.parse(
          JSON.parse(node?.first_response?.content)[0].value,
        );
      } else if (node.type === 'single_choice') {
        initialDynamic = JSON.parse(node?.first_response?.content)[0].value;
      }
    } catch (exception) {
      if (node.type === 'multiple_choice') {
        initialDynamic = { selected: [] };
      } else if (node.type === 'single_choice') {
        initialDynamic = '';
      }
    }
    return initialDynamic;
  }

  getAssignment() {
    const assignment = document.getElementById(
      `attribution-${this.props.task.dbid}`,
    );
    if (assignment) {
      return assignment.value;
    }
    return null;
  }

  getCurrentUser() {
    return new CheckContext(this).getContextStore().currentUser;
  }

  fail = (transaction) => {
    const message = getErrorMessage(
      transaction,
      <GenericUnknownErrorMessage />,
    );
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

    const parentType = task.annotated_type
      .replace(/([a-z])([A-Z])/, '$1_$2')
      .toLowerCase();

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

  handleUpdateMultiselectMetadata = (textValue) => {
    const { task } = this.props;
    this.setState({ textValue });
    const matchingTaskIndex = this.props.localResponses.findIndex(item => item.node.dbid === task.dbid);
    const mutatedLocalResponses = this.props.localResponses;
    if (task.type === 'single_choice') {
      mutatedLocalResponses[matchingTaskIndex].node.first_response_value = textValue;
    } else {
      // value is an object, we transform it to a string separated by ', '
      let tempValue = textValue.selected.join(', ');
      if (textValue.other) {
        tempValue += `, ${textValue.other}`;
      }
      mutatedLocalResponses[matchingTaskIndex].node.first_response_value = tempValue;
    }
    this.props.setLocalResponses([...mutatedLocalResponses]);
  };

  handleUpdateResponse = (edited_response, file) => {
    const { media, task } = this.props;
    this.setState({ isSaving: true });

    const onSuccess = () =>
      this.setState({
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

    const parentType = task.annotated_type
      .replace(/([a-z])([A-Z])/, '$1_$2')
      .toLowerCase();

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

    const onSuccess = () =>
      this.setState({ message: null, editingAssignment: false });

    const parentType = task.annotated_type
      .replace(/([a-z])([A-Z])/, '$1_$2')
      .toLowerCase();

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
    const onSuccess = () =>
      this.setState({ message: null, editingAttribution: false });

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

  submitDeleteTaskResponse = (deleteId) => {
    const { task } = this.props;
    const { deleteResponse } = this.state;
    this.setState({ isSaving: true });

    const onSuccess = () => {
      this.setState({ deleteResponse: null, isSaving: false });
    };

    let id = null;
    if (task.fieldset === 'metadata') {
      id = deleteId;
    } else {
      ({ id } = deleteResponse);
    }

    Relay.Store.commitUpdate(
      new DeleteDynamicMutation({
        parent_type: 'task',
        annotated: task,
        id,
      }),
      { onSuccess, onFailure: this.fail },
    );
  };

  generateMessages = about => (
    {
      MetadataLocation: {
        customize: (
          <FormattedMessage
            id="metadata.location.customize"
            defaultMessage="Customize place name"
            description="This is a label that appears on a text field, related to a pin on a map. The user may type any text of their choice here and name the place they are pinning. They can also modify suggested place names here."
          />
        ),
        coordinates: (
          <FormattedMessage
            id="metadata.location.coordinates"
            defaultMessage="Latitude, longitude"
            description="This is a label that appears on a text field, related to a pin on a map. This contains the latitude and longitude coordinates of the map pin. If the user changes these numbers, the map pin moves. If the user moves the map pin, the numbers update to reflect the new pin location."
          />
        ),
        coordinatesHelper: (
          <FormattedMessage
            id="metadata.location.coordinates.helper"
            defaultMessage={'Should be a comma-separated pair of latitude and longitude coordinates like "-12.9, -38.15". Drag the map pin if you are having difficulty.'}
            description="This is a helper message that appears when someone enters text in the 'Latitude, longitude' text field that cannot be parsed as a valid pair of latitude and longitude coordinates. It tells the user that they need to provide valid coordinates and gives an example. It also tells them that they can do a drag action with the mouse on the visual map pin as an alternative to entering numbers in this field."
          />
        ),
        search: (
          <FormattedMessage
            id="metadata.location.search"
            defaultMessage="Search the map"
            description="This is a label that appears on a text field. If the user begins to type a location they will receive a list of suggested place names."
          />
        ),
      },
      MetadataFile: {
        dropFile: (
          <FormattedMessage
            id="metadata.file.dropFile"
            defaultMessage="Drag and drop a file here, or click to upload a file (max size: {fileSizeLabel}, allowed extensions: {extensions})"
            description="This message appears in a rectangle, instructing the user that they can use their mouse to drag and drop a file, or click to pull up a file selector menu. This also tells them the maximum allowed file size, and the valid types of files that the user can upload. The `fileSizeLabel` variable will read something like '1.0 MB', and the 'extensions' variable is a list of valid file extensions. Neither will be localized."
            values={{
              fileSizeLabel: about ? about.file_max_size : '',
              extensions: about ? about.file_extensions?.join(', ') : '',
            }}
          />
        ),
        errorTooManyFiles: (
          <FormattedMessage
            id="metadata.file.tooManyFiles"
            defaultMessage="You can only upload one file here. Please try uploading one file."
            description="This message appears when a user tries to add two or more files at once to the file upload widget."
          />
        ),

        errorInvalidFile: (
          <FormattedMessage
            id="metadata.file.invalidFile"
            defaultMessage="This is not a valid file. Please try again with a different file."
            description="This message appears when a user tries to add two or more files at once to the file upload widget."
          />
        ),

        errorFileTooBig: (
          <FormattedMessage
            id="metadata.file.tooBig"
            defaultMessage="This file is too big. The maximum allowed file size is {fileSizeLabel}. Please try again with a different file."
            description="This message appears when a user tries to upload a file that is too big. The 'fileSizeLabel' will read something like '1.0 MB' and will not be localized."
            values={{
              fileSizeLabel: about ? about.file_max_size : '',
            }}
          />
        ),

        errorFileType: (
          <FormattedMessage
            id="metadata.file.wrongType"
            defaultMessage="This is not an accepted file type. Accepted file types include: {extensions}. Please try again with a different file."
            description="This message appears when a user tries to upload a file that is the wrong file type. The 'extensions' variable will be a list of file extensions (PDF, PNG, etc) and will not be localized."
            values={{
              extensions: about ? about.file_extensions?.join(', ') : '',
            }}
          />
        ),
      },
    }
  );

  renderTaskResponse(responseObj, response, by, byPictures, showEditIcon) {
    const { task, about } = this.props;
    const messages = task.fieldset === 'metadata' ? this.generateMessages(about) : {};

    const EditButton = () => (
      <StyledMetadataButton>
        <Button onClick={() => this.handleAction('edit_response', responseObj)} className="metadata-edit">
          <FormattedMessage
            id="metadata.edit"
            defaultMessage="Edit"
            description="This is a label that appears on a button next to an item that the user can edit. The label indicates that if the user presses this button, the item will become editable."
          />
        </Button>
      </StyledMetadataButton>
    );

    const CancelButton = () => (
      <StyledMetadataButton>
        <Button
          className="metadata-cancel"
          onClick={() => {
            this.setState({ editingResponse: false });
            this.setState({ textValue: this.getMultiselectInitialValue(task) || task.first_response_value || '' });
          }}
        >
          <FormattedMessage
            id="metadata.cancel"
            defaultMessage="Cancel"
            description="This is a label that appears on a button next to an item that the user is editing. The label indicates that if the user presses this button, the user will 'cancel' the editing action and all changes will revert."
          />
        </Button>
      </StyledMetadataButton>
    );

    const SaveButton = (props) => {
      const {
        disabled,
        uploadables,
        mutationPayload,
        required,
        empty,
      } = props;
      const payload =
        mutationPayload?.response_multiple_choice ||
        mutationPayload?.response_single_choice ||
        null;
      return (
        <StyledMetadataButton>
          <Button
            className="metadata-save"
            data-required={required}
            data-empty={empty}
            onClick={() => {
              let tempTextValue;
              // if multiple choice, textValue is an object, we transform it to a string separated by ', '
              if (task.type === 'multiple_choice') {
                tempTextValue = this.state.textValue.selected.join(', ');
                if (this.state.textValue.other) {
                  tempTextValue += `, ${this.state.textValue.other}`;
                }
              } else {
                tempTextValue = this.state.textValue;
              }
              // if there's a blank submission, and an existing submission exists, treat as a delete action
              if (!payload && !this.state.textValue && task.first_response_value) {
                this.submitDeleteTaskResponse(task.first_response.id);
              } else if (tempTextValue === task?.first_response_value) {
                // if the current submission hasn't changed at all, do nothing

              } else if (responseObj) {
                this.handleUpdateResponse(
                  payload || this.state.textValue,
                  uploadables ? uploadables['file[]'] : null,
                );
              } else {
                this.handleSubmitResponse(
                  payload || this.state.textValue,
                  uploadables ? uploadables['file[]'] : null,
                );
              }
            }}
            disabled={disabled}
          >
            <FormattedMessage
              id="metadata.save"
              defaultMessage="Save"
              description="This is a label that appears on a button next to an item that the user is editing. The label indicates that if the user presses this button, the user will save the changes they have been making."
            />
          </Button>
        </StyledMetadataButton>
      );
    };

    const DeleteButton = (props) => {
      const { onClick } = props;
      return (
        <StyledMetadataButton>
          <Button
            className="metadata-delete"
            onClick={() => {
              if (onClick) {
                onClick();
              }
              this.submitDeleteTaskResponse(task.first_response.id);
            }}
          >
            <FormattedMessage
              id="metadata.delete"
              defaultMessage="Delete"
              description="This is a label that appears on a button next to an item that the user can delete. The label indicates that if the user presses this button, the item will be deleted."
            />
          </Button>
        </StyledMetadataButton>
      );
    };

    const FieldInformation = () => (
      <StyledFieldInformation>
        <Typography variant="h6">{task.label}<StyledRequired>{task.team_task.required ? ' *' : null}</StyledRequired></Typography>
        <Typography variant="subtitle2">
          <ParsedText text={task.description} />
        </Typography>
      </StyledFieldInformation>
    );

    const AnnotatorInformation = () => {
      let updated_at;
      try {
        updated_at = JSON.parse(responseObj.content)[0]?.updated_at;
      } catch (exception) {
        updated_at = null;
      }
      const timeAgo = moment(updated_at).fromNow();
      return (
        responseObj && responseObj.annotator ? (
          <StyledAnnotatorInformation>
            <Typography variant="body1">
              Saved {timeAgo} by{' '}
              <a
                href={`/check/user/${responseObj.annotator.user.dbid}`}
              >
                {responseObj.annotator.user.name}
              </a>
            </Typography>
          </StyledAnnotatorInformation>)
          : null
      );
    };

    if (
      this.state.editingResponse && responseObj &&
      this.state.editingResponse.id === responseObj.id
    ) {
      const editingResponseData = getResponseData(this.state.editingResponse);
      const editingResponseText = editingResponseData.response;
      return (
        <div className="task__editing">
          <form name={`edit-response-${this.state.editingResponse.id}`}>
            {task.type === 'free_text' && task.fieldset === 'metadata' ? (
              <MetadataText
                node={task}
                classes={{}}
                DeleteButton={DeleteButton}
                CancelButton={CancelButton}
                SaveButton={SaveButton}
                EditButton={EditButton}
                AnnotatorInformation={AnnotatorInformation}
                FieldInformation={FieldInformation}
                hasData={task.first_response_value}
                isEditing={this.props.isEditing}
                disabled={!this.props.isEditing}
                required={task.team_task.required}
                metadataValue={
                  this.state.textValue
                }
                setMetadataValue={(textValue) => {
                  this.setState({ textValue });
                }}
              />
            ) : null}
            {task.type === 'free_text' && task.fieldset === 'tasks' ? (
              <ShortTextRespondTask
                fieldset={task.fieldset}
                task={task}
                response={editingResponseText}
                onSubmit={this.handleUpdateResponse}
                onDismiss={this.handleCancelEditResponse}
              />
            ) : null}
            {task.type === 'number' && task.fieldset === 'tasks' ? (
              <NumberRespondTask
                fieldset={task.fieldset}
                task={task}
                response={editingResponseText}
                onSubmit={this.handleUpdateResponse}
                onDismiss={this.handleCancelEditResponse}
              />
            ) : null}
            {task.type === 'number' && task.fieldset === 'metadata' ? (
              <MetadataNumber
                node={task}
                classes={{}}
                DeleteButton={DeleteButton}
                CancelButton={CancelButton}
                SaveButton={SaveButton}
                EditButton={EditButton}
                AnnotatorInformation={AnnotatorInformation}
                FieldInformation={FieldInformation}
                hasData={task.first_response_value}
                isEditing={this.props.isEditing}
                disabled={!this.props.isEditing}
                required={task.team_task.required}
                metadataValue={
                  this.state.textValue
                }
                setMetadataValue={(textValue) => {
                  this.setState({ textValue });
                }}
              />
            ) : null}
            {task.type === 'geolocation' && task.fieldset === 'metadata' ? (
              <StyledMapEditor>
                <MetadataLocation
                  node={task}
                  DeleteButton={DeleteButton}
                  CancelButton={CancelButton}
                  SaveButton={SaveButton}
                  EditButton={EditButton}
                  AnnotatorInformation={AnnotatorInformation}
                  FieldInformation={FieldInformation}
                  hasData={task.first_response_value}
                  isEditing={this.props.isEditing}
                  disabled={!this.props.isEditing}
                  required={task.team_task.required}
                  metadataValue={
                    this.state.textValue
                  }
                  setMetadataValue={(textValue) => {
                    this.setState({ textValue });
                  }}
                  mapboxApiKey={config.mapboxApiKey}
                  messages={messages.MetadataLocation}
                />
              </StyledMapEditor>
            ) : null}
            {task.type === 'geolocation' && task.fieldset === 'tasks' ? (
              <GeolocationRespondTask
                fieldset={task.fieldset}
                response={editingResponseText}
                onSubmit={this.handleUpdateResponse}
                onDismiss={this.handleCancelEditResponse}
              />
            ) : null}
            {task.type === 'datetime' && task.fieldset === 'metadata' ? (
              <MetadataDate
                node={task}
                classes={{}}
                DeleteButton={DeleteButton}
                CancelButton={CancelButton}
                SaveButton={SaveButton}
                EditButton={EditButton}
                AnnotatorInformation={AnnotatorInformation}
                FieldInformation={FieldInformation}
                hasData={task.first_response_value}
                isEditing={this.props.isEditing}
                disabled={!this.props.isEditing}
                required={task.team_task.required}
                metadataValue={
                  this.state.textValue
                }
                setMetadataValue={(textValue) => {
                  this.setState({ textValue });
                }}
              />
            ) : null}
            {task.type === 'datetime' && task.fieldset === 'tasks' ? (
              <DatetimeRespondTask
                fieldset={task.fieldset}
                response={editingResponseText}
                timezones={task.jsonoptions}
                onSubmit={this.handleUpdateResponse}
                onDismiss={this.handleCancelEditResponse}
              />
            ) : null}
            {task.type === 'single_choice' && task.fieldset === 'metadata' ? (
              <MetadataMultiselect
                isSingle
                node={task}
                classes={{}}
                DeleteButton={DeleteButton}
                CancelButton={CancelButton}
                SaveButton={SaveButton}
                EditButton={EditButton}
                AnnotatorInformation={AnnotatorInformation}
                FieldInformation={FieldInformation}
                hasData={task.first_response_value}
                isEditing={this.props.isEditing}
                disabled={!this.props.isEditing}
                required={task.team_task.required}
                metadataValue={
                  this.state.textValue
                }
                setMetadataValue={this.handleUpdateMultiselectMetadata}
              />
            ) : null}
            {task.type === 'single_choice' && task.fieldset === 'tasks' ? (
              <SingleChoiceTask
                fieldset={task.fieldset}
                mode="edit_response"
                response={editingResponseText}
                jsonoptions={task.jsonoptions}
                onDismiss={this.handleCancelEditResponse}
                onSubmit={this.handleUpdateResponse}
              />
            ) : null}
            {task.type === 'multiple_choice' && task.fieldset === 'metadata' ? (
              <MetadataMultiselect
                node={task}
                classes={{}}
                DeleteButton={DeleteButton}
                CancelButton={CancelButton}
                SaveButton={SaveButton}
                EditButton={EditButton}
                AnnotatorInformation={AnnotatorInformation}
                FieldInformation={FieldInformation}
                hasData={task.first_response_value}
                isEditing={this.props.isEditing}
                disabled={!this.props.isEditing}
                required={task.team_task.required}
                metadataValue={
                  this.state.textValue
                }
                setMetadataValue={this.handleUpdateMultiselectMetadata}
              />
            ) : null}
            {task.type === 'multiple_choice' && task.fieldset === 'tasks' ? (
              <MultiSelectTask
                fieldset={task.fieldset}
                mode="edit_response"
                jsonresponse={editingResponseText}
                jsonoptions={task.jsonoptions}
                onDismiss={this.handleCancelEditResponse}
                onSubmit={this.handleUpdateResponse}
              />
            ) : null}
            {task.type === 'file_upload' && task.fieldset === 'metadata' ? (
              <MetadataFile
                node={task}
                DeleteButton={DeleteButton}
                CancelButton={CancelButton}
                SaveButton={SaveButton}
                EditButton={EditButton}
                AnnotatorInformation={AnnotatorInformation}
                FieldInformation={FieldInformation}
                hasData={task.first_response_value}
                isEditing={this.props.isEditing}
                disabled={!this.props.isEditing}
                required={task.team_task.required}
                metadataValue={
                  this.state.textValue
                }
                setMetadataValue={(textValue) => {
                  this.setState({ textValue });
                }}
                extensions={about.file_extensions}
                fileSizeMax={about.file_max_size_in_bytes}
                messages={messages.MetadataFile}
              />
            ) : null}
            {task.type === 'file_upload' && task.fieldset === 'tasks' ? (
              <FileUploadRespondTask
                fieldset={task.fieldset}
                task={task}
                response={editingResponseText}
                onSubmit={this.handleUpdateResponse}
                onDismiss={this.handleCancelEditResponse}
              />
            ) : null}
          </form>
        </div>
      );
    }
    let fileUploadPath = null;
    if (
      task.type === 'file_upload' &&
      responseObj &&
      responseObj.file_data &&
      responseObj.file_data.length
    ) {
      [fileUploadPath] = responseObj.file_data;
    }
    return (
      <StyledWordBreakDiv className="task__resolved">
        {task.type === 'free_text' && task.fieldset === 'tasks' ?
          <div className="task__response">
            <ParsedText text={response} />
          </div>
          : null}
        {task.type === 'free_text' && task.fieldset === 'metadata' ? (
          <div className="task__response">
            <MetadataText
              node={task}
              classes={{}}
              DeleteButton={DeleteButton}
              CancelButton={CancelButton}
              SaveButton={SaveButton}
              EditButton={EditButton}
              AnnotatorInformation={AnnotatorInformation}
              FieldInformation={FieldInformation}
              hasData={task.first_response_value}
              isEditing={this.props.isEditing}
              disabled={!this.props.isEditing}
              required={task.team_task.required}
              metadataValue={
                this.state.textValue
              }
              setMetadataValue={(textValue) => {
                this.setState({ textValue });
              }}
            />
          </div>
        ) : null}
        {task.type === 'number' && task.fieldset === 'tasks' ? (
          <div className="task__response" style={{ textAlign: 'right' }}>
            {response}
          </div>
        ) : null}
        {task.type === 'number' && task.fieldset === 'metadata' ? (
          <div className="task__response">
            <MetadataNumber
              node={task}
              classes={{}}
              DeleteButton={DeleteButton}
              CancelButton={CancelButton}
              SaveButton={SaveButton}
              EditButton={EditButton}
              AnnotatorInformation={AnnotatorInformation}
              FieldInformation={FieldInformation}
              hasData={task.first_response_value}
              isEditing={this.props.isEditing}
              disabled={!this.props.isEditing}
              required={task.team_task.required}
              metadataValue={
                this.state.textValue
              }
              setMetadataValue={(textValue) => {
                this.setState({ textValue });
              }}
            />
          </div>
        ) : null}
        {task.type === 'geolocation' && task.fieldset === 'tasks' ? (
          <div className="task__response">
            <GeolocationTaskResponse response={response} />
          </div>
        ) : null}
        {task.type === 'geolocation' && task.fieldset === 'metadata' ? (
          <StyledMapEditor>
            <div className="task__response">
              <MetadataLocation
                node={task}
                DeleteButton={DeleteButton}
                CancelButton={CancelButton}
                SaveButton={SaveButton}
                EditButton={EditButton}
                AnnotatorInformation={AnnotatorInformation}
                FieldInformation={FieldInformation}
                hasData={!!task?.first_response_value}
                isEditing={this.props.isEditing}
                disabled={!this.props.isEditing}
                required={task.team_task.required}
                metadataValue={
                  this.state.textValue
                }
                setMetadataValue={(textValue) => {
                  this.setState({ textValue });
                }}
                mapboxApiKey={config.mapboxApiKey}
                messages={messages.MetadataLocation}
              />
            </div>
          </StyledMapEditor>
        ) : null}
        {task.type === 'datetime' && task.fieldset === 'metadata' ? (
          <div className="task__response">
            <MetadataDate
              node={task}
              classes={{}}
              DeleteButton={DeleteButton}
              CancelButton={CancelButton}
              SaveButton={SaveButton}
              EditButton={EditButton}
              AnnotatorInformation={AnnotatorInformation}
              FieldInformation={FieldInformation}
              hasData={task.first_response_value}
              isEditing={this.props.isEditing}
              disabled={!this.props.isEditing}
              required={task.team_task.required}
              metadataValue={
                this.state.textValue
              }
              setMetadataValue={(textValue) => {
                this.setState({ textValue });
              }}
            />
          </div>
        ) : null}
        {task.type === 'datetime' && task.fieldset === 'tasks' ? (
          <div className="task__response">
            <DatetimeTaskResponse response={response} />
          </div>
        ) : null}
        {task.type === 'single_choice' && task.fieldset === 'tasks' ? (
          <SingleChoiceTask
            mode="show_response"
            response={response}
            jsonoptions={task.jsonoptions}
          />
        ) : null}
        {task.type === 'single_choice' && task.fieldset === 'metadata' ? (
          <div className="task__response">
            <StyledMultiselect>
              <MetadataMultiselect
                isSingle
                node={task}
                classes={{}}
                DeleteButton={DeleteButton}
                CancelButton={CancelButton}
                SaveButton={SaveButton}
                EditButton={EditButton}
                AnnotatorInformation={AnnotatorInformation}
                FieldInformation={FieldInformation}
                hasData={task.first_response_value}
                isEditing={this.props.isEditing}
                disabled={!this.props.isEditing}
                required={task.team_task.required}
                metadataValue={
                  this.state.textValue
                }
                setMetadataValue={this.handleUpdateMultiselectMetadata}
              />
            </StyledMultiselect>
          </div>
        ) : null}
        {task.type === 'multiple_choice' && task.fieldset === 'tasks' ? (
          <MultiSelectTask
            mode="show_response"
            jsonresponse={response}
            jsonoptions={task.jsonoptions}
          />
        ) : null}
        {task.type === 'multiple_choice' && task.fieldset === 'metadata' ? (
          <div className="task__response">
            <StyledMultiselect>
              <MetadataMultiselect
                node={task}
                classes={{}}
                DeleteButton={DeleteButton}
                CancelButton={CancelButton}
                SaveButton={SaveButton}
                EditButton={EditButton}
                AnnotatorInformation={AnnotatorInformation}
                FieldInformation={FieldInformation}
                hasData={task.first_response_value}
                isEditing={this.props.isEditing}
                disabled={!this.props.isEditing}
                required={task.team_task.required}
                metadataValue={
                  this.state.textValue
                }
                setMetadataValue={this.handleUpdateMultiselectMetadata}
              />
            </StyledMultiselect>
          </div>
        ) : null}
        {task.type === 'file_upload' && task.fieldset === 'tasks' ? (
          <div className="task__response">
            <Box component="p" textAlign="center">
              {fileUploadPath ? (
                <Box
                  component="a"
                  href={fileUploadPath}
                  target="_blank"
                  rel="noreferrer noopener"
                  color={checkBlue}
                >
                  {response}
                </Box>
              ) : (
                <CircularProgress />
              )}
            </Box>
          </div>
        ) : null}
        {task.type === 'file_upload' && task.fieldset === 'metadata' ? (
          <div className="task__response">
            <MetadataFile
              node={task}
              DeleteButton={DeleteButton}
              CancelButton={CancelButton}
              SaveButton={SaveButton}
              EditButton={EditButton}
              AnnotatorInformation={AnnotatorInformation}
              FieldInformation={FieldInformation}
              hasData={task.first_response_value}
              isEditing={this.props.isEditing}
              disabled={!this.props.isEditing}
              required={task.team_task.required}
              metadataValue={
                this.state.textValue
              }
              setMetadataValue={(textValue) => {
                this.setState({ textValue });
              }}
              extensions={about.file_extensions}
              fileSizeMax={about.file_max_size_in_bytes}
              messages={messages.MetadataFile}
            />
          </div>
        ) : null}
        {by && byPictures && task.fieldset !== 'metadata' ? (
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
            {showEditIcon && can(responseObj.permissions, 'update Dynamic') ? (
              <EditIcon
                style={{ width: 16, height: 16, cursor: 'pointer' }}
                onClick={() => this.handleAction('edit_response', responseObj)}
              />
            ) : null}
          </Box>
        ) : null}
      </StyledWordBreakDiv>
    );
  }

  render() {
    const { task: teamTask, media } = this.props;
    const task = { ...teamTask };
    const isTask = task.fieldset === 'tasks';
    const data = getResponseData(task.first_response);
    const { response, by, byPictures } = data;
    const currentUser = this.getCurrentUser();
    const isArchived = !(media.archived === CheckArchivedFlags.NONE);

    task.cannotAct =
      !response &&
      !can(media.permissions, 'create Task') &&
      !can(task.permissions, 'destroy Task');

    let taskAssigned = false;
    const taskAnswered = !!response;

    const assignments = task.assignments.edges;
    const assignmentComponents = [];
    assignments.forEach((assignment) => {
      assignmentComponents.push(
        <ProfileLink teamUser={assignment.node.team_user || null} />,
      );
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

    const taskActions = !isArchived ? (
      <Box display="flex" alignItems="center">
        {taskAssignment}
        {data.by ? (
          <Box
            className="task__resolver"
            display="flex"
            alignItems="center"
            margin={2}
          >
            <Box component="small" display="flex">
              <UserAvatars users={byPictures} />
              <Box component="span" lineHeight="24px" px={1}>
                {response ? (
                  <FormattedMessage
                    id="task.answeredBy"
                    defaultMessage="Completed by {byName}"
                    values={{ byName: <Sentence list={by} /> }}
                  />
                ) : null}
              </Box>
            </Box>
          </Box>
        ) : null}
        <Box marginLeft="auto">
          <TaskActions
            task={task}
            media={media}
            response={response}
            onSelect={this.handleAction}
          />
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
    if (!isArchived) {
      if (!response || task.responses.edges.length > 1) {
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

            {zeroAnswer && task.fieldset === 'metadata' ? (
              <Can permissions={media.permissions} permission="create Dynamic">
                <div>
                  <form name={`task-response-${task.id}`}>
                    <div className="task__response-inputs">
                      {
                        this.renderTaskResponse(
                          task.first_response,
                          response,
                          false,
                          false,
                          false,
                        )
                      }
                    </div>
                  </form>
                </div>
              </Can>
            ) : null}

            {zeroAnswer && task.fieldset === 'tasks' ? (
              <Can permissions={media.permissions} permission="create Dynamic">
                <div>
                  <form name={`task-response-${task.id}`}>
                    <div className="task__response-inputs">
                      {task.type === 'free_text' ? (
                        <ShortTextRespondTask
                          task={task}
                          fieldset={task.fieldset}
                          onSubmit={this.handleSubmitResponse}
                        />
                      ) : null}
                      {task.type === 'number' ? (
                        <NumberRespondTask
                          task={task}
                          fieldset={task.fieldset}
                          onSubmit={this.handleSubmitResponse}
                        />
                      ) : null}
                      {task.type === 'geolocation' ? (
                        <GeolocationRespondTask
                          fieldset={task.fieldset}
                          onSubmit={this.handleSubmitResponse}
                        />
                      ) : null}
                      {task.type === 'datetime' ? (
                        <DatetimeRespondTask
                          timezones={task.jsonoptions}
                          fieldset={task.fieldset}
                          onSubmit={this.handleSubmitResponse}
                        />
                      ) : null}
                      {task.type === 'single_choice' ? (
                        <SingleChoiceTask
                          fieldset={task.fieldset}
                          mode="respond"
                          response={response}
                          jsonoptions={task.jsonoptions}
                          onSubmit={this.handleSubmitResponse}
                        />
                      ) : null}
                      {task.type === 'multiple_choice' ? (
                        <MultiSelectTask
                          fieldset={task.fieldset}
                          mode="respond"
                          jsonresponse={response}
                          jsonoptions={task.jsonoptions}
                          onSubmit={this.handleSubmitResponse}
                        />
                      ) : null}
                      {task.type === 'file_upload' ? (
                        <FileUploadRespondTask
                          fieldset={task.fieldset}
                          task={task}
                          onSubmit={this.handleSubmitResponse}
                        />
                      ) : null}
                    </div>
                  </form>
                </div>
              </Can>
            ) : null}
          </div>
        );
      } else {
        taskBody = this.renderTaskResponse(
          task.first_response,
          response,
          false,
          false,
          false,
        );
      }
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

    if (task.fieldset === 'metadata') {
      return (
        <div>
          {taskBody}
        </div>
      );
    }

    return (
      // Task cards
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
                <Box marginBottom={2}>{taskBody}</Box>
              </CardContent>
              {taskActions}
              {isTask ? <TaskLog task={task} response={response} /> : null}
            </Collapse>
          </Card>
        </Box>

        {this.state.editingQuestion ? (
          <EditTaskDialog
            task={task}
            message={this.state.message}
            taskType={task.type}
            onDismiss={() => this.setState({ editingQuestion: false })}
            onSubmit={this.handleUpdateTask}
            noOptions
          />
        ) : null}

        {this.state.editingAssignment ? (
          <AttributionDialog
            taskType={task.type}
            open={this.state.editingAssignment}
            title={
              <FormattedMessage
                id="tasks.editAssignment"
                defaultMessage="Edit assignment"
              />
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
          />
        ) : null}

        {this.state.editingAttribution ? (
          <AttributionDialog
            taskType={task.type}
            open={this.state.editingAttribution}
            title={
              <FormattedMessage
                id="tasks.editAttribution"
                defaultMessage="Edit attribution"
              />
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
          />
        ) : null}

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
          title={
            <FormattedMessage
              id="task.confirmDeleteTitle"
              defaultMessage="Delete task?"
            />
          }
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
          title={
            <FormattedMessage
              id="task.confirmDeleteResponseTitle"
              defaultMessage="Delete answer?"
            />
          }
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
    teamSlug: /^\/([^/]+)/.test(window.location.pathname)
      ? window.location.pathname.match(/^\/([^/]+)/)[1]
      : null,
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
        team_task {
          required,
        },
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
        first_response_value,
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
