import React from 'react';
import PropTypes from 'prop-types';
import { commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
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
  object,
  updateMutation,
  deleteMutation,
  deleteMessage,
  setFlashMessage,
  intl,
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
        id="projectActions.defaultErrorMessage"
        defaultMessage="Error, please try again"
        description="Generic error message displayed when it's not possible to update or delete a list"
      />
    ), 'error');
  };

  const handleSuccess = () => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        id="projectActions.savedSuccessfully"
        defaultMessage="Done"
        description="Generic success message displayed when a list is updated or deleted"
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
    <Can permissions={team.permissions} permission="create Project">
      <ButtonMain
        variant="outlined"
        size="small"
        theme="text"
        iconCenter={<IconMoreVert className="project-actions__icon" />}
        onClick={(e) => { setAnchorEl(e.currentTarget); }}
        className={cx('project-actions', searchResultsStyles.searchHeaderActionButton)}
        title={intl.formatMessage(messages.actionsTooltip)}
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
                id="projectActions.rename"
                defaultMessage="Rename"
                description="'Rename' here is an infinitive verb"
              />
            }
          />
        </MenuItem>
        <MenuItem className="project-actions__destroy" onClick={handleDeleteClick}>
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
        <Divider />
      </Menu>

      {/* "Edit" dialog */}
      <ConfirmProceedDialog
        open={showEditDialog}
        title={
          <FormattedMessage
            id="projectsComponent.renameType"
            defaultMessage="Rename list"
            description="'Rename' here is an infinitive verb"
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
                  description="Label for the title input when renaming a list"
                />
              }
              defaultValue={object.title}
              onChange={(e) => { setNewTitle(e.target.value); }}
              variant="outlined"
              className="project-actions__edit-title"
            />
          </Box>
        }
        proceedDisabled={!newTitle && !object.title}
        proceedLabel={
          <FormattedMessage
            id="projectsComponent.renameType"
            defaultMessage="Rename list"
            description="'Rename' here is an infinitive verb"
          />
        }
        onProceed={handleUpdate}
        isSaving={saving}
        cancelLabel={<FormattedMessage id="global.cancel" defaultMessage="Cancel" description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation" />}
        onCancel={handleClose}
      />

      {/* "Delete" dialog */}
      <ConfirmProceedDialog
        open={showDeleteDialog}
        title={
          <FormattedMessage
            id="projectsComponent.deleteTitleType"
            defaultMessage="Delete list?"
            description="'Delete' here is an infinitive verb"
          />
        }
        body={
          <p className="typography-body1">
            {deleteMessage}
          </p>
        }
        proceedLabel={
          <FormattedMessage
            id="projectsComponent.deleteType"
            defaultMessage="Delete list"
            description="'Delete' here is an infinitive verb"
          />
        }
        onProceed={handleDelete}
        isSaving={saving}
        cancelLabel={<FormattedMessage id="global.cancel" defaultMessage="Cancel" description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation" />}
        onCancel={handleClose}
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
