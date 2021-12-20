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
import Can from '../../Can'; // eslint-disable-line import/no-duplicates
import { can } from '../../Can'; // eslint-disable-line import/no-duplicates
import SelectProjectDialog from '../../media/SelectProjectDialog';
import { units } from '../../../styles/js/shared';
import globalStrings from '../../../globalStrings';

const ProjectActions = ({
  name,
  object,
  objectType,
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
  const [showDeleteProjectDialog, setShowDeleteProjectDialog] = React.useState(false);
  const [showMoveDialog, setShowMoveDialog] = React.useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = React.useState(false);
  const [privacyValue, setPrivacyValue] = React.useState(object.privacy);
  const { team, permissions: projectPermissions } = object;

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
    setShowDeleteProjectDialog(false);
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

  const handleDelete = (dstProj) => {
    setSaving(true);

    const input = { id: object.id };
    if (dstProj) {
      input.items_destination_project_id = dstProj.dbid;
    }
    commitMutation(Store, {
      mutation: deleteMutation,
      variables: { input },
      onCompleted: (response, error) => {
        if (error) {
          handleError();
        } else {
          handleSuccess(response);
          const retPath = objectType === 'Project' && dstProj ? `/${team.slug}/project/${dstProj.dbid}` : `/${team.slug}/all-items`;
          browserHistory.push(retPath);
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
              is_default
              permissions
              privacy
              project_group_id
            }
            previous_default_project {
              id
              is_default
              permissions
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

  const handleMakeDefault = () => {
    handleUpdateProject({
      is_default: true,
      previous_default_project_id: team.default_folder.dbid,
    });
  };

  const handleDeleteClick = () => {
    if (objectType === 'Project') {
      if (object.medias_count === 0) {
        handleDelete();
      } else {
        setShowDeleteProjectDialog(true);
      }
    } else {
      setShowDeleteDialog(true);
    }
  };

  // Should disable delete from objectType = 'Project' if user has no permissions to destroy
  const disableDeleteProject = objectType === 'Project' && !can(projectPermissions, 'destroy Project');

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
        <MenuItem disabled={disableDeleteProject} className="project-actions__destroy" onClick={handleDeleteClick}>
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
        <Divider />
        { hasPrivacySettings && can(team.permissions, 'set_privacy Project') ?
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
          </MenuItem> : null }
        { objectType === 'Project' ?
          <MenuItem disabled={object.is_default} className="project-make_default" onClick={handleMakeDefault}>
            <ListItemText
              primary={
                <FormattedMessage
                  id="projectActions.makeDefault"
                  defaultMessage="Make default"
                  description="Make the folder default"
                />
              }
            />
          </MenuItem> : null }
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
        cancelLabel={<FormattedMessage {...globalStrings.cancel} />}
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
        cancelLabel={<FormattedMessage {...globalStrings.cancel} />}
        onCancel={handleClose}
      />

      {/* "Delete" Project dialog */}
      <SelectProjectDialog
        open={showDeleteProjectDialog}
        excludeProjectDbids={object ? [object.dbid] : []}
        title={
          <FormattedMessage
            id="bulkActions.dialogMoveTitle"
            defaultMessage="{mediasCount, plural, one {You need to move 1 item to another folder} other {You need to move # items to another folder}}"
            values={{
              mediasCount: object.medias_count,
            }}
          />
        }
        extraContent={deleteMessage}
        cancelLabel={<FormattedMessage {...globalStrings.cancel} />}
        submitLabel={
          <FormattedMessage
            id="projectActions.moveTitle"
            defaultMessage="Move items and delete folder"
            description="Label for button to move items and delete folder"
          />
        }
        submitButtonClassName="media-bulk-actions__move-button"
        onSubmit={handleDelete}
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
        cancelLabel={<FormattedMessage {...globalStrings.cancel} />}
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
  objectType: PropTypes.string.isRequired,
  updateMutation: PropTypes.object.isRequired,
  deleteMutation: PropTypes.object.isRequired,
  deleteMessage: PropTypes.object.isRequired,
  noDescription: PropTypes.bool,
  isMoveable: PropTypes.bool,
  hasPrivacySettings: PropTypes.bool,
};

export default withSetFlashMessage(ProjectActions);
