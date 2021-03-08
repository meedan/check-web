import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import { browserHistory } from 'react-router';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import IconMoreVert from '@material-ui/icons/MoreVert';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import ConfirmProceedDialog from '../layout/ConfirmProceedDialog';
import DeleteProjectMutation from '../../relay/mutations/DeleteProjectMutation';
import ProjectAssignment from './ProjectAssignment';
import { can } from '../Can';
import { withSetFlashMessage } from '../FlashMessage';
import CheckContext from '../../CheckContext';

class ProjectActions extends Component {
  state = {
    anchorEl: null,
    openAssignPopup: false,
    showConfirmDeleteProjectDialog: false,
    projectDeletionConfirmed: false,
  };

  handleEdit = () => {
    browserHistory.push(`${window.location.pathname.match(/.*\/project\/\d+/)[0]}/edit`);
  };

  handleOpenMenu = (e) => {
    this.setState({ anchorEl: e.currentTarget });
  };

  handleCloseMenu = () => {
    this.setState({ anchorEl: null });
  };

  handleAssign = () => {
    this.setState({ openAssignPopup: true });
  };

  handleAssignClose = () => {
    this.setState({ openAssignPopup: false, anchorEl: null });
  };

  handleConfirmDestroy = () => {
    this.setState({ showConfirmDeleteProjectDialog: true, anchorEl: null });
  };

  handleCloseDialog() {
    this.setState({ showConfirmDeleteProjectDialog: false });
  }

  handleConfirmation() {
    this.setState({ projectDeletionConfirmed: !this.state.projectDeletionConfirmed });
  }

  handleDestroy() {
    const { project, team } = new CheckContext(this).getContextStore();

    const onSuccess = () => {
      const message = (
        <FormattedMessage
          id="projectActions.projectDeleted"
          defaultMessage="List deleted successfully."
        />
      );
      this.props.setFlashMessage(message, 'success');
    };

    const onFailure = () => {
      // FIXME: Get error message from backend
      const message = (
        <FormattedMessage
          id="projectActions.projectNotDeleted"
          defaultMessage="Sorry, could not delete list."
        />
      );
      this.props.setFlashMessage(message, 'error');
    };

    Relay.Store.commitUpdate(
      new DeleteProjectMutation({
        project,
        team,
      }),
      { onSuccess, onFailure },
    );

    browserHistory.push(`/${team.slug}/all-items`);
  }

  render() {
    const {
      project,
    } = this.props;

    const menuItems = [];

    if (can(project.permissions, 'update Project')) {
      menuItems.push((
        <MenuItem
          key="projectActions.edit"
          className="project-actions__edit"
          onClick={this.handleEdit}
        >
          <ListItemText
            primary={
              <FormattedMessage id="ProjectActions.edit" defaultMessage="Edit name and description" />
            }
          />
        </MenuItem>));
    }

    if (can(project.permissions, 'update Project')) {
      menuItems.push((
        <MenuItem
          key="projectActions.assign"
          className="project-actions__assign"
          onClick={this.handleAssign}
        >
          <ListItemText
            primary={
              <FormattedMessage id="projectActions.assignOrUnassign" defaultMessage="Assign list to…" />
            }
          />
        </MenuItem>));
    }

    if (can(project.permissions, 'destroy Project')) {
      menuItems.push((
        <MenuItem
          key="projectActions.destroy"
          className="project-actions__destroy"
          onClick={this.handleConfirmDestroy}
        >
          <ListItemText
            primary={
              <FormattedMessage id="projectActions.destroy" defaultMessage="Delete" />
            }
          />
        </MenuItem>
      ));
    }

    if (!menuItems.length) {
      return null;
    }

    return (
      <React.Fragment>
        <IconButton
          className="project-actions"
          tooltip={
            <FormattedMessage id="ProjectActions.tooltip" defaultMessage="List actions" />
          }
          onClick={this.handleOpenMenu}
        >
          <IconMoreVert className="project-actions__icon" />
        </IconButton>
        <Menu
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.handleCloseMenu}
        >
          {menuItems}
        </Menu>
        <ConfirmProceedDialog
          open={this.state.showConfirmDeleteProjectDialog}
          title={
            <FormattedMessage
              id="projectActions.deleteProjectTitle"
              defaultMessage="Are you sure you want to delete this list?"
            />
          }
          body={(
            <div>
              <Typography variant="body1" component="p" paragraph>
                <FormattedMessage
                  id="projectActions.deleteProjectBody"
                  defaultMessage='The list will be deleted for everyone in this workspace. All items in the list will still be accessible in the "All items" list'
                />
              </Typography>
            </div>
          )}
          proceedLabel={<FormattedMessage id="projectActions.proceedLabel" defaultMessage="Delete list" />}
          onCancel={this.handleCloseDialog.bind(this)}
          onProceed={this.handleDestroy.bind(this)}
        />
        {
          this.state.openAssignPopup ?
            <ProjectAssignment
              assignmentDialogOpened={Boolean(this.state.anchorEl)}
              onDismiss={this.handleAssignClose}
              project={project}
            />
            : null
        }
      </React.Fragment>
    );
  }
}

ProjectActions.propTypes = {
  setFlashMessage: PropTypes.func.isRequired,
};

ProjectActions.contextTypes = {
  store: PropTypes.object,
};

export default withSetFlashMessage(injectIntl(ProjectActions));
