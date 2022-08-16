import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { MetadataText, MetadataFile, MetadataDate, MetadataNumber, MetadataLocation, MetadataMultiselect, MetadataUrl } from '@meedan/check-ui';
import styled from 'styled-components';
import moment from 'moment';
import Can, { can } from '../Can';
import { withSetFlashMessage } from '../FlashMessage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import NavigateAwayDialog from '../NavigateAwayDialog';
import ParsedText from '../ParsedText';
import { getErrorMessage } from '../../helpers';
import ProfileLink from '../layout/ProfileLink';
import CheckContext from '../../CheckContext';
import UpdateTaskMutation from '../../relay/mutations/UpdateTaskMutation';
import UpdateDynamicMutation from '../../relay/mutations/UpdateDynamicMutation';
import DeleteAnnotationMutation from '../../relay/mutations/DeleteAnnotationMutation';
import DeleteDynamicMutation from '../../relay/mutations/DeleteDynamicMutation';
import {
  units,
  black16,
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
      editingResponse: false,
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
    this.props.setFlashMessage(message, 'error');
    this.setState({ isSaving: false });
  };

  handleAction = (action, value) => {
    switch (action) {
    case 'edit_response':
      this.setState({ editingResponse: value });
      break;
    default:
    }
  };

  handleCancelEditResponse = () => this.setState({ editingResponse: false });

  handleSubmitResponse = (response, file) => {
    const { media, task } = this.props;
    this.setState({ isSaving: true });

    const onSuccess = () => {
      this.setState({ isSaving: false });
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
    // deep copy the local responses object
    const mutatedLocalResponses = JSON.parse(JSON.stringify(this.props.localResponses));
    if (task.type === 'single_choice') {
      mutatedLocalResponses[matchingTaskIndex].node.first_response_value = textValue;
    } else {
      // value is an object, we transform it to a string separated by ', '
      let tempValue = textValue.selected?.join(', ');
      if (textValue.other) {
        tempValue += `, ${textValue.other}`;
      }
      mutatedLocalResponses[matchingTaskIndex].node.first_response_value = tempValue;
    }
    this.props.setLocalResponses([...mutatedLocalResponses]);
  };

  handleUpdateResponse = (edited_response, file, responseObj) => {
    const { media, task } = this.props;
    this.setState({ isSaving: true });

    const onSuccess = () =>
      this.setState({
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
          // in some legacy data cases we can lack an 'editingResponse' id, but in those cases there's always a responseObj id
          id: this.state.editingResponse.id || responseObj.id,
          fields,
        },
      }),
      { onSuccess, onFailure },
    );
  };

  submitDeleteTask = () => {
    const { task, media } = this.props;
    this.setState({ isSaving: true });

    const onSuccess = () => {
      this.setState({ isSaving: false });
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
    this.setState({ isSaving: true });

    const onSuccess = () => {
      this.setState({ isSaving: false });
    };

    let id = null;
    id = deleteId;

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
            defaultMessage={'Should be a comma-separated pair of latitude and longitude coordinates like "-12.9, -38.15". Drag the map pin if you are having difficulty.'} // eslint-disable-line @calm/react-intl/missing-attribute
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
      MetadataUrl: {
        helperText: (
          <FormattedMessage
            id="metadata.url.helperText"
            defaultMessage="Must be a valid URL"
            description="A message that appears underneath a text box when a user enters text that a web browser would not interpret as a URL."
          />
        ),
      },
    }
  );

  renderTaskResponse(responseObj) {
    const { task, about } = this.props;
    const messages = this.generateMessages(about);

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
        anyInvalidUrls,
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
            data-urlerror={anyInvalidUrls}
            onClick={() => {
              let tempTextValue;
              const isEmptyUrlArray = () => task.type === 'url' && this.state.textValue?.filter(item => item.url !== '' || item.title !== '').length === 0;
              // if multiple choice, textValue is an object, we transform it to a string separated by ', '
              if (task.type === 'multiple_choice') {
                tempTextValue = this.state.textValue.selected?.join(', ');
                if (this.state.textValue.other) {
                  tempTextValue += `, ${this.state.textValue.other}`;
                }
              } else {
                tempTextValue = this.state.textValue;
              }
              // in the case of multiple/single choice we need to set the textTempValue of an empty annotation to null rather than empty string, so it matches the state of first_response_value
              if (task.type === 'multiple_choice' || task.type === 'single_choice') {
                if (tempTextValue === '') {
                  tempTextValue = null;
                }
              }
              if (!payload && (!this.state.textValue || isEmptyUrlArray()) && task.first_response_value && task.first_response?.id) {
                this.submitDeleteTaskResponse(task.first_response.id);
              } else if (tempTextValue === task?.first_response_value) {
                // if the current submission hasn't changed at all, do nothing
              } else if (responseObj) {
                // if there is a pre-existing response, we must be updating a record
                this.handleUpdateResponse(
                  payload || this.state.textValue,
                  uploadables ? uploadables['file[]'] : null,
                  responseObj,
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

    const ProgressLabel = ({ fileName }) => (
      <Typography variant="body1" gutterBottom>
        <FormattedMessage
          id="metadata.uploadProgressLabel"
          defaultMessage="Saving {file}…"
          description="This is a label that appears while a file upload is ongoing."
          values={{ file: fileName }}
        />
      </Typography>
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
                href={`/check/user/${responseObj.annotator.user?.dbid}`}
              >
                {responseObj.annotator.user?.name}
              </a>
            </Typography>
          </StyledAnnotatorInformation>)
          : null
      );
    };

    return (
      <StyledWordBreakDiv key={responseObj?.dbid} className="task__resolved">
        {task.type === 'free_text' ? (
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
        {task.type === 'number' ? (
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
        {task.type === 'geolocation' ? (
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
        {task.type === 'datetime' ? (
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
        {task.type === 'single_choice' ? (
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
        {task.type === 'multiple_choice' ? (
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
        {task.type === 'file_upload' ? (
          <div className="task__response">
            { this.state.isSaving ?
              <NavigateAwayDialog
                hasUnsavedChanges={this.state.isSaving}
                title={
                  <FormattedMessage
                    id="task.uploadWarningTitle"
                    defaultMessage="There is an ongoing file upload"
                    description="Warning to prevent user from navigating away while upload is running"
                  />
                }
                body={
                  <FormattedMessage
                    id="task.uploadWarningBody"
                    defaultMessage="Navigating away from this page may cause the interruption of the file upload."
                    description="Warning to prevent user from navigating away while upload is running"
                  />
                }
              /> : null
            }
            <MetadataFile
              node={task}
              DeleteButton={DeleteButton}
              CancelButton={CancelButton}
              SaveButton={SaveButton}
              EditButton={EditButton}
              AnnotatorInformation={AnnotatorInformation}
              FieldInformation={FieldInformation}
              ProgressLabel={ProgressLabel}
              hasData={task.first_response_value}
              isEditing={this.props.isEditing}
              isSaving={this.state.isSaving}
              disabled={!this.props.isEditing}
              required={task.team_task.required}
              metadataValue={
                this.state.textValue
              }
              setMetadataValue={(textValue) => {
                this.setState({ textValue });
              }}
              extensions={about.file_extensions || []}
              fileSizeMax={about.file_max_size_in_bytes}
              messages={messages.MetadataFile}
            />
          </div>
        ) : null}
        {task.type === 'url' ? (
          <MetadataUrl
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
            messages={messages.MetadataUrl}
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
      </StyledWordBreakDiv>
    );
  }

  render() {
    const { task: teamTask, media } = this.props;
    const task = { ...teamTask };
    const data = getResponseData(task.first_response);
    const { response } = data;
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

    const zeroAnswer = task.responses.edges?.length === 0;

    let taskBody = null;
    if (!isArchived) {
      if (!response || task.responses.edges?.length > 1) {
        taskBody = (
          <div>
            <StyledTaskResponses>
              {task.responses.edges.map(singleResponse => this.renderTaskResponse(singleResponse.node))}
            </StyledTaskResponses>

            {zeroAnswer ? (
              <Can permissions={media.permissions} permission="create Dynamic">
                <div>
                  <form name={`task-response-${task.id}`}>
                    <div className="task__response-inputs">
                      {
                        this.renderTaskResponse(task.first_response)
                      }
                    </div>
                  </form>
                </div>
              </Can>
            ) : null}
          </div>
        );
      } else {
        taskBody = this.renderTaskResponse(task.first_response);
      }
    }

    task.project_media = Object.assign({}, this.props.media);
    delete task.project_media.tasks;

    const className = ['task', `task-type__${task.type}`];
    if (taskAnswered) {
      className.push('task__answered-by-current-user');
    }
    if (taskAssigned) {
      className.push('task__assigned-to-current-user');
    }

    return (
      <div>
        {taskBody}
      </div>
    );
  }
}

Task.contextTypes = {
  store: PropTypes.object,
};

// eslint-disable-next-line import/no-unused-modules
export { Task as TaskComponentTest };

export default Relay.createContainer(withSetFlashMessage(Task), {
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
