/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import cx from 'classnames/bind';
import TextField from '../../cds/inputs/TextField';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';
import { withSetFlashMessage } from '../../FlashMessage';
import Can from '../../Can'; // eslint-disable-line import/no-duplicates
import searchResultsStyles from '../../search/SearchResults.module.css';
import IconMoreVert from '../../../icons/more_vert.svg';

const messages = defineMessages({
  actionsTooltip: {
    id: 'projectActions.tooltip',
    defaultMessage: 'Actions',
    description: 'Toolitp for the button that shows actions that can be performed on a list',
  },
});

const ProjectActions = ({
  deleteMessage,
  deleteMutation,
  intl,
  object,
  setFlashMessage,
  updateMutation,
}) => {
  const [newTitle, setNewTitle] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [showEditDialog, setShowEditDialog] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const { team } = object;

  if (!team) {
    return null;
  }

  const handleClose = () => {
    setAnchorEl(null);
    setShowEditDialog(false);
    setShowDeleteDialog(false);
  };

  const handleError = () => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        defaultMessage="Error, please try again"
        description="Generic error message displayed when it's not possible to update or delete a list"
        id="projectActions.defaultErrorMessage"
      />
    ), 'error');
  };

  const handleSuccess = () => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        defaultMessage="Done"
        description="Generic success message displayed when a list is updated or deleted"
        id="projectActions.savedSuccessfully"
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

    const input = { id: object.id };
    commitMutation(Store, {
      mutation: deleteMutation,
      variables: { input },
      onCompleted: (response, error) => {
        if (error) {
          handleError();
        } else {
          handleSuccess(response);
          const retPath = `/${team.slug}/all-items`;
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

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  return (
    <Can permission="create Project" permissions={team.permissions}>
      <ButtonMain
        className={cx('project-actions', searchResultsStyles.searchHeaderActionButton)}
        iconCenter={<IconMoreVert className="project-actions__icon" />}
        size="small"
        theme="text"
        title={intl.formatMessage(messages.actionsTooltip)}
        variant="outlined"
        onClick={(e) => { setAnchorEl(e.currentTarget); }}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem className="project-actions__edit" onClick={() => { setShowEditDialog(true); }}>
          <ListItemText
            primary={
              <FormattedMessage
                defaultMessage="Rename"
                description="'Rename' here is an infinitive verb"
                id="projectActions.rename"
              />
            }
          />
        </MenuItem>
        <MenuItem className="project-actions__destroy" onClick={handleDeleteClick}>
          <ListItemText
            primary={
              <FormattedMessage
                defaultMessage="Delete"
                description="'Delete' here is an infinitive verb"
                id="projectActions.delete"
              />
            }
          />
        </MenuItem>
      </Menu>

      {/* "Edit" dialog */}
      <ConfirmProceedDialog
        body={
          <TextField
            className="project-actions__edit-title"
            defaultValue={object.title}
            id="project-actions__edit-title-input"
            label={
              <FormattedMessage
                defaultMessage="Title"
                description="Label for the title input when renaming a list"
                id="projectsComponent.title"
              />
            }
            variant="outlined"
            onChange={(e) => { setNewTitle(e.target.value); }}
          />
        }
        cancelLabel={<FormattedMessage defaultMessage="Cancel" description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation" id="global.cancel" />}
        isSaving={saving}
        open={showEditDialog}
        proceedDisabled={!newTitle && !object.title}
        proceedLabel={
          <FormattedMessage
            defaultMessage="Rename list"
            description="'Rename' here is an infinitive verb"
            id="projectsComponent.renameType"
          />
        }
        title={
          <FormattedMessage
            defaultMessage="Rename list"
            description="'Rename' here is an infinitive verb"
            id="projectsComponent.renameType"
          />
        }
        onCancel={handleClose}
        onProceed={handleUpdate}
      />

      {/* "Delete" dialog */}
      <ConfirmProceedDialog
        body={
          <p className="typography-body1">
            {deleteMessage}
          </p>
        }
        cancelLabel={<FormattedMessage defaultMessage="Cancel" description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation" id="global.cancel" />}
        isSaving={saving}
        open={showDeleteDialog}
        proceedLabel={
          <FormattedMessage
            defaultMessage="Delete list"
            description="'Delete' here is an infinitive verb"
            id="projectsComponent.deleteType"
          />
        }
        title={
          <FormattedMessage
            defaultMessage="Delete list?"
            description="'Delete' here is an infinitive verb"
            id="projectsComponent.deleteTitleType"
          />
        }
        onCancel={handleClose}
        onProceed={handleDelete}
      />
    </Can>
  );
};

ProjectActions.propTypes = {
  object: PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
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
};

export default withSetFlashMessage(injectIntl(ProjectActions));
