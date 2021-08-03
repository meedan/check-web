import React from 'react';
import PropTypes from 'prop-types';
import { commitMutation, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import IconMoreVert from '@material-ui/icons/MoreVert';
import Divider from '@material-ui/core/Divider';
import Select from '@material-ui/core/Select';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import TextField from '@material-ui/core/TextField';
import ProjectMoveDialog from '../../project/ProjectMoveDialog';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';
import SettingsHeader from '../../team/SettingsHeader';
import { withSetFlashMessage } from '../../FlashMessage';
import Can from '../../Can';
import { units } from '../../../styles/js/shared';

const ProjectActions = ({
  name,
  object,
  updateMutation,
  deleteMutation,
  deleteMessage,
  noDescription,
  isMoveable,
  hasPrivacySettings,
  setFlashMessage,
}) => {
  const [newTitle, setNewTitle] = React.useState('');
  const [newDescription, setNewDescription] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [showEditDialog, setShowEditDialog] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [showMoveDialog, setShowMoveDialog] = React.useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = React.useState(false);
  const [privacyValue, setPrivacyValue] = React.useState(object.privacy);
  const { team } = object;

  const privacyMessages = [
    <FormattedMessage id="projectActions.privacyMessageAll" defaultMessage="Anyone can see this folder, access its content and annotate it." />,
    <FormattedMessage id="projectActions.privacyMessageEditors" defaultMessage="Collaborators will not be able to see or access this folder, or any items it contains. All annotations will be preserved." />,
    <FormattedMessage id="projectActions.privacyMessageAdmins" defaultMessage="Editors and collaborators will not be able to see or access this folder, or any items it contains. All annotations will be preserved." />,
  ];

  const privacyMessage = privacyMessages[privacyValue];

  if (!team) {
    return null;
  }

  const handleClose = () => {
    setAnchorEl(null);
    setShowEditDialog(false);
    setShowDeleteDialog(false);
    setShowMoveDialog(false);
    setShowPrivacyDialog(false);
  };

  const handleError = () => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        id="projectActions.defaultErrorMessage"
        defaultMessage="Error, please try again"
        description="Generic error message displayed when it's not possible to update or delete a collection, folder or list"
      />
    ), 'error');
  };

  const handleSuccess = () => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        id="projectActions.savedSuccessfully"
        defaultMessage="Done"
        description="Generic success message displayed when a collection, folder or list is updated or deleted"
      />
    ), 'success');
    setNewTitle('');
    handleClose();
  };

  const handleUpdate = () => {
    setSaving(true);

    const input = {
      id: object.id,
    };

    if (!noDescription && newDescription) {
      input.description = newDescription;
    }

    if (newTitle) {
      input.title = newTitle;
    }

    commitMutation(Store, {
      mutation: updateMutation,
      variables: {
        input,
      },
      onCompleted: (response, error) => {
        if (error) {
          handleError();
        } else {
          handleSuccess(response);
        }
      },
      onError: () => {
        handleError();
      },
    });
  };

  const handleDelete = () => {
    setSaving(true);

    commitMutation(Store, {
      mutation: deleteMutation,
      variables: {
        input: {
          id: object.id,
        },
      },
      onCompleted: (response, error) => {
        if (error) {
          handleError();
        } else {
          handleSuccess(response);
          browserHistory.push(`/${team.slug}/all-items`);
        }
      },
      onError: () => {
        handleError();
      },
      optimisticResponse: {
        destroyProject: {
          deletedId: object.id,
          team: {
            id: team.id,
          },
        },
      },
      configs: [
        {
          type: 'RANGE_DELETE',
          parentID: team.id,
          pathToConnection: ['team', 'projects'],
          deletedIDFieldName: 'deletedId',
        },
        {
          type: 'RANGE_DELETE',
          parentID: team.id,
          pathToConnection: ['team', 'project_groups'],
          deletedIDFieldName: 'deletedId',
        },
        {
          type: 'RANGE_DELETE',
          parentID: team.id,
          pathToConnection: ['team', 'saved_searches'],
          deletedIDFieldName: 'deletedId',
        },
        {
          type: 'NODE_DELETE',
          deletedIDFieldName: 'deletedId',
        },
      ],
    });
  };

  const handleUpdateProject = (variables) => {
    setSaving(true);

    commitMutation(Store, {
      mutation: graphql`
        mutation ProjectActionsUpdateProjectMutation($input: UpdateProjectInput!) {
          updateProject(input: $input) {
            project {
              id
              privacy
              project_group_id
            }
            project_group_was {
              id
              medias_count
            }
          }
        }
      `,
      variables: {
        input: Object.assign({ id: object.id }, variables),
      },
      onCompleted: (response, error) => {
        if (error) {
          handleError();
        } else {
          handleSuccess(response);
        }
      },
      onError: () => {
        handleError();
      },
    });
  };

  const handleMoveOut = () => {
    handleUpdateProject({
      previous_project_group_id: object.project_group_id,
      project_group_id: null,
    });
  };

  const handleChangePrivacy = (e) => {
    setPrivacyValue(e.target.value);
  };

  const handleProceedPrivacy = () => {
    handleUpdateProject({ privacy: privacyValue });
  };

  return (
    <Can permissions={team.permissions} permission="create Project">
      <IconButton
        className="project-actions"
        tooltip={
          <FormattedMessage id="projectActions.tooltip" defaultMessage="Actions" />
        }
        onClick={(e) => { setAnchorEl(e.currentTarget); }}
      >
        <IconMoreVert className="project-actions__icon" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem className="project-actions__edit" onClick={() => { setShowEditDialog(true); }}>
          <ListItemText
            primary={
              <FormattedMessage
                id="projectActions.rename"
                defaultMessage="Rename"
                description="'Rename' here is an infinitive verb"
              />
            }
          />
        </MenuItem>
        <MenuItem className="project-actions__destroy" onClick={() => { setShowDeleteDialog(true); }}>
          <ListItemText
            primary={
              <FormattedMessage
                id="projectActions.delete"
                defaultMessage="Delete"
                description="'Delete' here is an infinitive verb"
              />
            }
          />
        </MenuItem>
        { isMoveable ?
          <MenuItem className="project-actions__move" onClick={() => { setShowMoveDialog(true); }}>
            <ListItemText
              primary={
                <FormattedMessage
                  id="projectActions.move"
                  defaultMessage="Move to…"
                  description="'Move' here is an infinitive verb"
                />
              }
            />
          </MenuItem> : null }
        { isMoveable && object.project_group_id ?
          <MenuItem className="project-actions__move-out" onClick={handleMoveOut}>
            <ListItemText
              primary={
                <FormattedMessage
                  id="projectActions.moveOut"
                  defaultMessage="Move out"
                  description="Menu option to move a folder out of a collection"
                />
              }
            />
          </MenuItem> : null }
        { hasPrivacySettings ?
          <Can permissions={team.permissions} permission="set_privacy Project">
            <React.Fragment>
              <Divider />
              <MenuItem className="project-actions__privacy" onClick={() => { setShowPrivacyDialog(true); }}>
                <ListItemText
                  primary={
                    <FormattedMessage
                      id="projectActions.privacy"
                      defaultMessage="Change access"
                      description="'Change' here is an infinitive verb"
                    />
                  }
                />
              </MenuItem>
            </React.Fragment>
          </Can> : null }
      </Menu>

      {/* "Edit" dialog */}
      <ConfirmProceedDialog
        open={showEditDialog}
        title={
          <FormattedMessage
            id="projectsComponent.renameType"
            defaultMessage="Rename {type}"
            values={{ type: name }}
            description="'Rename' here is an infinitive verb, and 'type' can be collection, folder or list"
          />
        }
        body={
          <Box>
            <TextField
              id="project-actions__edit-title-input"
              label={
                <FormattedMessage
                  id="projectsComponent.title"
                  defaultMessage="Title"
                />
              }
              defaultValue={object.title}
              onChange={(e) => { setNewTitle(e.target.value); }}
              variant="outlined"
              margin="normal"
              className="project-actions__edit-title"
              fullWidth
            />
            { !noDescription ?
              <TextField
                id="project-actions__edit-description-input"
                label={
                  <FormattedMessage
                    id="projectsComponent.description"
                    defaultMessage="Description"
                  />
                }
                defaultValue={object.description}
                onChange={(e) => { setNewDescription(e.target.value); }}
                variant="outlined"
                margin="normal"
                className="project-actions__edit-description"
                fullWidth
              /> : null }
          </Box>
        }
        proceedDisabled={!newTitle && !object.title}
        proceedLabel={
          <FormattedMessage
            id="projectsComponent.renameType"
            defaultMessage="Rename {type}"
            values={{ type: name }}
            description="'Rename' here is an infinitive verb, and 'type' can be collection, folder or list"
          />
        }
        onProceed={handleUpdate}
        isSaving={saving}
        cancelLabel={<FormattedMessage id="projectActions.cancel" defaultMessage="Cancel" />}
        onCancel={handleClose}
      />

      {/* "Delete" dialog */}
      <ConfirmProceedDialog
        open={showDeleteDialog}
        title={
          <FormattedMessage
            id="projectsComponent.deleteType"
            defaultMessage="Delete {type}"
            values={{ type: name }}
            description="'Delete' here is an infinitive verb, and 'type' can be collection, folder or list"
          />
        }
        body={
          <Typography variant="body1" component="p" paragraph>
            {deleteMessage}
          </Typography>
        }
        proceedLabel={
          <FormattedMessage
            id="projectsComponent.deleteType"
            defaultMessage="Delete {type}"
            values={{ type: name }}
            description="'Delete' here is an infinitive verb, and 'type' can be collection, folder or list"
          />
        }
        onProceed={handleDelete}
        isSaving={saving}
        cancelLabel={<FormattedMessage id="projectActions.cancel" defaultMessage="Cancel" />}
        onCancel={handleClose}
      />

      {/* "Move" dialog */}
      { showMoveDialog ?
        <ProjectMoveDialog
          onCancel={handleClose}
          project={object}
        /> : null }

      {/* "Privacy" dialog */}
      <ConfirmProceedDialog
        open={showPrivacyDialog}
        title={
          <SettingsHeader
            title={
              <FormattedMessage
                id="projectsComponent.privacyDialogTitle"
                defaultMessage="Who can see this folder and its content"
                description="Title for folder privacy dialog"
              />
            }
            helpUrl="https://help.checkmedia.org/en/articles/5229479-folders-and-collections"
            style={{ marginBottom: units(-3), paddingBottom: 0 }}
          />
        }
        body={
          <Box>
            <Box mb={1}>
              <Select value={privacyValue} onChange={handleChangePrivacy} fullWidth variant="outlined">
                <MenuItem value={0}>
                  <FormattedMessage
                    id="projectsComponent.privacyDialogOptionAll"
                    defaultMessage="Everyone with access to this workspace"
                  />
                </MenuItem>
                <MenuItem value={1}>
                  <FormattedMessage
                    id="projectsComponent.privacyDialogOptionEditors"
                    defaultMessage="Only Admins and Editors"
                  />
                </MenuItem>
                <MenuItem value={2}>
                  <FormattedMessage
                    id="projectsComponent.privacyDialogOptionAdmins"
                    defaultMessage="Only Admins"
                  />
                </MenuItem>
              </Select>
            </Box>
            <Typography variant="body1" component="p" paragraph>
              {privacyMessage}
            </Typography>
          </Box>
        }
        proceedLabel={
          <FormattedMessage
            id="projectsComponent.privacyDialogButton"
            defaultMessage="Update access"
          />
        }
        onProceed={handleProceedPrivacy}
        isSaving={saving}
        cancelLabel={<FormattedMessage id="projectActions.cancel" defaultMessage="Cancel" />}
        onCancel={handleClose}
      />
    </Can>
  );
};

ProjectActions.defaultProps = {
  noDescription: false,
  isMoveable: false,
  hasPrivacySettings: false,
};

ProjectActions.propTypes = {
  name: PropTypes.object.isRequired, // Readable name (e.g., "collection", "folder", "list", etc.)
  object: PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    project_group_id: PropTypes.number,
    privacy: PropTypes.number,
    team: PropTypes.shape({
      id: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired,
      permissions: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  updateMutation: PropTypes.object.isRequired,
  deleteMutation: PropTypes.object.isRequired,
  deleteMessage: PropTypes.object.isRequired,
  noDescription: PropTypes.bool,
  isMoveable: PropTypes.bool,
  hasPrivacySettings: PropTypes.bool,
};

export default withSetFlashMessage(ProjectActions);
