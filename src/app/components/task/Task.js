import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import { MetadataFile, MetadataDate, MetadataNumber, MetadataLocation, MetadataMultiselect, MetadataUrl } from '@meedan/check-ui';
import moment from 'moment';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import MetadataText from '../metadata/MetadataText';
import Can, { can } from '../Can';
import { withSetFlashMessage } from '../FlashMessage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import NavigateAwayDialog from '../NavigateAwayDialog';
import ParsedText from '../ParsedText';
import { getErrorMessage } from '../../helpers';
import CheckContext from '../../CheckContext';
import UpdateTaskMutation from '../../relay/mutations/UpdateTaskMutation';
import UpdateDynamicMutation from '../../relay/mutations/UpdateDynamicMutation';
import DeleteAnnotationMutation from '../../relay/mutations/DeleteAnnotationMutation';
import DeleteDynamicMutation from '../../relay/mutations/DeleteDynamicMutation';
import CheckArchivedFlags from '../../CheckArchivedFlags';
import styles from './Task.module.css';

function getResponseData(response) {
  const data = {};

  if (response) {
    data.by = [];
    data.byPictures = [];
    if (response.attribution) {
      response.attribution.edges.forEach((user) => {
        const u = user.node;
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
    if (task.type === 'single_choice' && mutatedLocalResponses[matchingTaskIndex]?.node) {
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
    const { media, task } = this.props;
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
            defaultMessage="Customize place name"
            description="This is a label that appears on a text field, related to a pin on a map. The user may type any text of their choice here and name the place they are pinning. They can also modify suggested place names here."
            id="metadata.location.customize"
          />
        ),
        coordinates: (
          <FormattedMessage
            defaultMessage="Latitude, longitude"
            description="This is a label that appears on a text field, related to a pin on a map. This contains the latitude and longitude coordinates of the map pin. If the user changes these numbers, the map pin moves. If the user moves the map pin, the numbers update to reflect the new pin location."
            id="metadata.location.coordinates"
          />
        ),
        coordinatesHelper: (
          <FormattedMessage
            defaultMessage="Should be a comma-separated pair of latitude and longitude coordinates like '-12.9, -38.15'. Drag the map pin if you are having difficulty."
            description="This is a helper message that appears when someone enters text in the 'Latitude, longitude' text field that cannot be parsed as a valid pair of latitude and longitude coordinates. It tells the user that they need to provide valid coordinates and gives an example. It also tells them that they can do a drag action with the mouse on the visual map pin as an alternative to entering numbers in this field."
            id="metadata.location.coordinates.helper"
          />
        ),
        search: (
          <FormattedMessage
            defaultMessage="Search the map"
            description="This is a label that appears on a text field. If the user begins to type a location they will receive a list of suggested place names."
            id="metadata.location.search"
          />
        ),
      },
      MetadataFile: {
        dropFile: (
          <FormattedMessage
            defaultMessage="Drag and drop a file here, or click to upload a file (max size: {fileSizeLabel}, allowed extensions: {extensions})"
            description="This message appears in a rectangle, instructing the user that they can use their mouse to drag and drop a file, or click to pull up a file selector menu. This also tells them the maximum allowed file size, and the valid types of files that the user can upload. The `fileSizeLabel` variable will read something like '1.0 MB', and the 'extensions' variable is a list of valid file extensions. Neither will be localized."
            id="metadata.file.dropFile"
            values={{
              fileSizeLabel: about ? about.file_max_size : '',
              extensions: about ? about.file_extensions?.join(', ') : '',
            }}
          />
        ),
        errorTooManyFiles: (
          <FormattedMessage
            defaultMessage="You can only upload one file here. Please try uploading one file."
            description="This message appears when a user tries to add two or more files at once to the file upload widget."
            id="metadata.file.tooManyFiles"
          />
        ),

        errorInvalidFile: (
          <FormattedMessage
            defaultMessage="This is not a valid file. Please try again with a different file."
            description="This message appears when a user tries to add two or more files at once to the file upload widget."
            id="metadata.file.invalidFile"
          />
        ),

        errorFileTooBig: (
          <FormattedMessage
            defaultMessage="This file is too big. The maximum allowed file size is {fileSizeLabel}. Please try again with a different file."
            description="This message appears when a user tries to upload a file that is too big. The 'fileSizeLabel' will read something like '1.0 MB' and will not be localized."
            id="metadata.file.tooBig"
            values={{
              fileSizeLabel: about ? about.file_max_size : '',
            }}
          />
        ),

        errorFileType: (
          <FormattedMessage
            defaultMessage="This is not an accepted file type. Accepted file types include: {extensions}. Please try again with a different file."
            description="This message appears when a user tries to upload a file that is the wrong file type. The 'extensions' variable will be a list of file extensions (PDF, PNG, etc) and will not be localized."
            id="metadata.file.wrongType"
            values={{
              extensions: about ? about.file_extensions?.join(', ') : '',
            }}
          />
        ),

        errorNoFile: (
          <FormattedMessage
            defaultMessage="This file is missing from the database. Edit and clear this annotation to upload a new file."
            description="This message appears when a user tries to access a file that does not exist in the database."
            id="metadata.file.noFile"
          />
        ),
      },
      MetadataUrl: {
        helperText: (
          <FormattedMessage
            defaultMessage="Must be a valid URL"
            description="A message that appears underneath a text box when a user enters text that a web browser would not interpret as a URL."
            id="metadata.url.helperText"
          />
        ),
      },
    }
  );

  renderTaskResponse(responseObj) {
    const { about, task } = this.props;
    const messages = this.generateMessages(about);

    const EditButton = () => (
      <div className={styles['task-metadata-button']}>
        <ButtonMain
          className="metadata-edit"
          label={
            <FormattedMessage
              defaultMessage="Edit"
              description="Generic label for a button or link for a user to press when they wish to edit content or functionality"
              id="global.edit"
            />
          }
          size="default"
          theme="info"
          variant="contained"
          onClick={() => this.handleAction('edit_response', responseObj)}
        />
      </div>
    );

    const CancelButton = () => (
      <div className={styles['task-metadata-button']}>
        <ButtonMain
          className="metadata-cancel"
          label={
            <FormattedMessage
              defaultMessage="Cancel"
              description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation"
              id="global.cancel"
            />
          }
          size="default"
          theme="lightText"
          variant="text"
          onClick={() => {
            this.setState({ editingResponse: false });
            this.setState({ textValue: this.getMultiselectInitialValue(task) || task.first_response_value || '' });
          }}
        />
      </div>
    );

    const SaveButton = (props) => {
      const {
        anyInvalidUrls,
        empty,
        mutationPayload,
        required,
        uploadables,
      } = props;
      const payload =
        mutationPayload?.response_multiple_choice ||
        mutationPayload?.response_single_choice ||
        null;
      return (
        <div className={styles['task-metadata-button']}>
          <ButtonMain
            buttonProps={{
              'data-required': required,
              'data-empty': empty,
              'data-urlerror': anyInvalidUrls,
            }}
            className="metadata-save"
            disabled={this.state.textValue === task.first_response_value}
            label={
              <FormattedMessage
                defaultMessage="Save"
                description="Generic label for a button or link for a user to press when they wish to save an action or setting"
                id="global.save"
              />
            }
            size="default"
            theme="info"
            variant="contained"
            onClick={() => {
              let tempTextValue;
              const isEmptyUrlArray = () => task.type === 'url' && Array.isArray(this.state.textValue) && this.state.textValue?.filter(item => item.url !== '' || item.title !== '').length === 0;
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
          />
        </div>
      );
    };

    const DeleteButton = (props) => {
      const { onClick } = props;
      return (
        <div className={styles['task-metadata-button']}>
          <ButtonMain
            className="metadata-delete"
            label={
              <FormattedMessage
                defaultMessage="Delete"
                description="Generic label for a button or link for a user to press when they wish to delete content or remove functionality"
                id="global.delete"
              />
            }
            size="default"
            theme="error"
            variant="contained"
            onClick={() => {
              if (onClick) {
                onClick();
              }
              this.submitDeleteTaskResponse(task.first_response.id);
            }}
          />
        </div>
      );
    };

    const FieldInformation = () => (
      <div className={styles['task-header']}>
        <div className="typography-subtitle2">
          {task.label}<sup>{task.team_task.required ? ' *' : null}</sup>
        </div>
        <div className="typography-body2-bold">
          <ParsedText text={task.description} />
        </div>
      </div>
    );

    const ProgressLabel = ({ fileName }) => (
      <FormattedMessage
        defaultMessage="Saving {file}…"
        description="This is a label that appears while a file upload is ongoing."
        id="metadata.uploadProgressLabel"
        tagName="p"
        values={{ file: fileName }}
      />
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
          <div className={styles['task-footer']}>
            <FormattedMessage
              defaultMessage="Saved {timeAgo} by {userName}"
              description="This is a label that indicates when and by whom the task was saved."
              id="task.savedByLabel"
              values={{ timeAgo, userName: responseObj.annotator.user?.name }}
            />
          </div>)
          : null
      );
    };

    return (
      <div className="task__resolved" key={responseObj?.dbid}>
        {task.type === 'free_text' ? (
          <div className="task__response">
            <MetadataText
              AnnotatorInformation={AnnotatorInformation}
              CancelButton={CancelButton}
              DeleteButton={DeleteButton}
              EditButton={EditButton}
              FieldInformation={FieldInformation}
              SaveButton={SaveButton}
              classes={{}}
              disabled={!this.props.isEditing}
              hasData={task.first_response_value}
              isEditing={this.props.isEditing}
              metadataValue={
                this.state.textValue
              }
              node={task}
              required={task.team_task.required}
              setMetadataValue={(textValue) => {
                this.setState({ textValue });
              }}
            />
          </div>
        ) : null}
        {task.type === 'number' ? (
          <div className="task__response">
            <MetadataNumber
              AnnotatorInformation={AnnotatorInformation}
              CancelButton={CancelButton}
              DeleteButton={DeleteButton}
              EditButton={EditButton}
              FieldInformation={FieldInformation}
              SaveButton={SaveButton}
              classes={{}}
              disabled={!this.props.isEditing}
              hasData={task.first_response_value}
              isEditing={this.props.isEditing}
              metadataValue={
                this.state.textValue
              }
              node={task}
              required={task.team_task.required}
              setMetadataValue={(textValue) => {
                this.setState({ textValue });
              }}
            />
          </div>
        ) : null}
        {task.type === 'geolocation' ? (
          <div className={styles['task-map']}>
            <div className="task__response">
              <MetadataLocation
                AnnotatorInformation={AnnotatorInformation}
                CancelButton={CancelButton}
                DeleteButton={DeleteButton}
                EditButton={EditButton}
                FieldInformation={FieldInformation}
                SaveButton={SaveButton}
                disabled={!this.props.isEditing}
                hasData={!!task?.first_response_value}
                isEditing={this.props.isEditing}
                mapboxApiKey={config.mapboxApiKey}
                messages={messages.MetadataLocation}
                metadataValue={
                  this.state.textValue
                }
                node={task}
                required={task.team_task.required}
                setMetadataValue={(textValue) => {
                  this.setState({ textValue });
                }}
              />
            </div>
          </div>
        ) : null}
        {task.type === 'datetime' ? (
          <div className="task__response">
            <MetadataDate
              AnnotatorInformation={AnnotatorInformation}
              CancelButton={CancelButton}
              DeleteButton={DeleteButton}
              EditButton={EditButton}
              FieldInformation={FieldInformation}
              SaveButton={SaveButton}
              classes={{}}
              disabled={!this.props.isEditing}
              hasData={task.first_response_value}
              isEditing={this.props.isEditing}
              metadataValue={
                this.state.textValue
              }
              node={task}
              required={task.team_task.required}
              setMetadataValue={(textValue) => {
                this.setState({ textValue });
              }}
            />
          </div>
        ) : null}
        {task.type === 'single_choice' ? (
          <div className="task__response">
            <MetadataMultiselect
              AnnotatorInformation={AnnotatorInformation}
              CancelButton={CancelButton}
              DeleteButton={DeleteButton}
              EditButton={EditButton}
              FieldInformation={FieldInformation}
              SaveButton={SaveButton}
              classes={{}}
              disabled={!this.props.isEditing}
              hasData={task.first_response_value}
              isEditing={this.props.isEditing}
              isSingle
              metadataValue={
                this.state.textValue
              }
              node={task}
              required={task.team_task.required}
              setMetadataValue={this.handleUpdateMultiselectMetadata}
            />
          </div>
        ) : null}
        {task.type === 'multiple_choice' ? (
          <div className="task__response">
            <MetadataMultiselect
              AnnotatorInformation={AnnotatorInformation}
              CancelButton={CancelButton}
              DeleteButton={DeleteButton}
              EditButton={EditButton}
              FieldInformation={FieldInformation}
              SaveButton={SaveButton}
              classes={{}}
              disabled={!this.props.isEditing}
              hasData={task.first_response_value}
              isEditing={this.props.isEditing}
              metadataValue={
                this.state.textValue
              }
              node={task}
              required={task.team_task.required}
              setMetadataValue={this.handleUpdateMultiselectMetadata}
            />
          </div>
        ) : null}
        {task.type === 'file_upload' ? (
          <div className="task__response">
            { this.state.isSaving ?
              <NavigateAwayDialog
                body={
                  <FormattedMessage
                    defaultMessage="Navigating away from this page may cause the interruption of the file upload."
                    description="Warning to prevent user from navigating away while upload is running"
                    id="task.uploadWarningBody"
                  />
                }
                hasUnsavedChanges={this.state.isSaving}
                title={
                  <FormattedMessage
                    defaultMessage="There is an ongoing file upload"
                    description="Warning to prevent user from navigating away while upload is running"
                    id="task.uploadWarningTitle"
                  />
                }
              /> : null
            }
            <MetadataFile
              AnnotatorInformation={AnnotatorInformation}
              CancelButton={CancelButton}
              DeleteButton={DeleteButton}
              EditButton={EditButton}
              FieldInformation={FieldInformation}
              ProgressLabel={ProgressLabel}
              SaveButton={SaveButton}
              disabled={!this.props.isEditing}
              extensions={about.file_extensions || []}
              fileSizeMax={about.file_max_size_in_bytes}
              hasData={task.first_response_value}
              isEditing={this.props.isEditing}
              isSaving={this.state.isSaving}
              messages={messages.MetadataFile}
              metadataValue={
                this.state.textValue
              }
              node={task}
              required={task.team_task.required}
              setMetadataValue={(textValue) => {
                this.setState({ textValue });
              }}
            />
          </div>
        ) : null}
        {task.type === 'url' ? (
          <MetadataUrl
            AnnotatorInformation={AnnotatorInformation}
            CancelButton={CancelButton}
            DeleteButton={DeleteButton}
            EditButton={EditButton}
            FieldInformation={FieldInformation}
            SaveButton={SaveButton}
            classes={{}}
            disabled={!this.props.isEditing}
            hasData={task.first_response_value}
            isEditing={this.props.isEditing}
            messages={messages.MetadataUrl}
            metadataValue={
              this.state.textValue
            }
            node={task}
            required={task.team_task.required}
            setMetadataValue={(textValue) => {
              this.setState({ textValue });
            }}
          />
        ) : null}
      </div>
    );
  }

  render() {
    const { media, task: teamTask } = this.props;
    const task = { ...teamTask };
    const data = getResponseData(task.first_response);
    const { response } = data;
    const currentUser = this.getCurrentUser();
    const isArchived = (media.archived === CheckArchivedFlags.TRASHED || media.archived === CheckArchivedFlags.SPAM);


    task.cannotAct =
      !response &&
      !can(media.permissions, 'create Task') &&
      !can(task.permissions, 'destroy Task');

    let taskAssigned = false;
    const taskAnswered = !!response;

    const assignments = task.assignments.edges;
    assignments.forEach((assignment) => {
      if (currentUser && assignment.node.dbid === currentUser.dbid) {
        taskAssigned = true;
      }
    });

    const zeroAnswer = task.responses.edges?.length === 0;

    let taskBody = null;
    if (!isArchived) {
      if (!response || task.responses.edges?.length > 1) {
        taskBody = (
          <>
            <div>
              {task.responses.edges.map(singleResponse => this.renderTaskResponse(singleResponse.node))}
            </div>

            {zeroAnswer ? (
              <Can permission="create Dynamic" permissions={media.permissions}>
                <form name={`task-response-${task.id}`}>
                  <div className="task__response-inputs">
                    {
                      this.renderTaskResponse(task.first_response)
                    }
                  </div>
                </form>
              </Can>
            ) : null}
          </>
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
      <div className={styles.task}>
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
                    is_active
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
              is_active
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
                is_active
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
