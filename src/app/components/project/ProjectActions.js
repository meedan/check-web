import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import IconMoreVert from '@material-ui/icons/MoreVert';
import IconButton from '@material-ui/core/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Button from '@material-ui/core/Button';
import Dialog from 'material-ui/Dialog';
import Checkbox from 'material-ui/Checkbox';
import DeleteProjectMutation from '../../relay/mutations/DeleteProjectMutation';
import { units } from '../../styles/js/shared';
import Message from '../Message';
import ProjectAssignment from './ProjectAssignment';
import Can, { can } from '../Can';
import CheckContext from '../../CheckContext';

class ProjectActions extends Component {
  state = {
    anchorEl: null,
    openAssignPopup: false,
    showConfirmDeleteProjectDialog: false,
    projectDeletionConfirmed: false,
    message: null,
  };

  handleEdit = () => {
    const { history } = new CheckContext(this).getContextStore();
    history.push(`${window.location.pathname.match(/.*\/project\/\d+/)[0]}/edit`);
  };

  handleClick = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleAssign = () => {
    this.setState({ openAssignPopup: true });
  };

  handleAssignClose = () => {
    this.setState({ openAssignPopup: false });
  };

  handleConfirmDestroy = () => {
    this.setState({ showConfirmDeleteProjectDialog: true });
  };

  handleCloseDialog() {
    this.setState({ showConfirmDeleteProjectDialog: false });
  }

  handleConfirmation() {
    this.setState({ projectDeletionConfirmed: !this.state.projectDeletionConfirmed });
  }

  handleDestroy() {
    if (this.state.projectDeletionConfirmed) {
      const { project, team, history } = new CheckContext(this).getContextStore();

      const onSuccess = () => {
        const message = (
          <FormattedMessage
            id="projectActions.projectDeleted"
            defaultMessage="List deleted successfully."
          />
        );
        this.context.setMessage(message);
      };

      const onFailure = () => {
        const message = (
          <FormattedMessage
            id="projectActions.projectNotDeleted"
            defaultMessage="Sorry, could not delete list."
          />
        );
        this.context.setMessage(message);
      };

      Relay.Store.commitUpdate(
        new DeleteProjectMutation({
          project,
          team,
        }),
        { onSuccess, onFailure },
      );

      history.push(`/${team.slug}/all-items`);
    }
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
          <FormattedMessage id="ProjectActions.edit" defaultMessage="Edit name and description" />
        </MenuItem>));
    }

    if (can(project.permissions, 'update Project')) {
      menuItems.push((
        <MenuItem
          key="projectActions.assign"
          className="project-actions__assign"
          onClick={this.handleAssign}
        >
          <FormattedMessage id="projectActions.assignOrUnassign" defaultMessage="Assign list" />
        </MenuItem>));
    }

    if (can(project.permissions, 'destroy Project')) {
      menuItems.push((
        <div>
          <MenuItem
            key="projectActions.destroy"
            className="project-actions__destroy"
            onClick={this.handleConfirmDestroy}
          >
            <FormattedMessage id="projectActions.destroy" defaultMessage="Delete" />
          </MenuItem>
        </div>
      ));
    }

    const actions = [
      <Button onClick={this.handleCloseDialog.bind(this)}>
        <FormattedMessage id="projectActions.cancelDelete" defaultMessage="Cancel" />
      </Button>,
      <Button
        color="primary"
        onClick={this.handleDestroy.bind(this)}
        disabled={!this.state.projectDeletionConfirmed}
      >
        <FormattedMessage id="projectActions.continue" defaultMessage="Continue" />
      </Button>,
    ];

    return menuItems.length ?
      <Can permissions={project.permissions} permission="update Project">
        <IconMenu
          onClick={this.handleClick}
          className="project-actions"
          iconButtonElement={
            <IconButton
              tooltip={
                <FormattedMessage id="ProjectActions.tooltip" defaultMessage="List actions" />
              }
            >
              <IconMoreVert className="project-actions__icon" />
            </IconButton>}
        >
          {menuItems}
        </IconMenu>
        <Dialog
          actions={actions}
          modal={false}
          open={this.state.showConfirmDeleteProjectDialog}
          onRequestClose={this.handleCloseDialog.bind(this)}
        >
          <Message message={this.state.message} />
          <h2>
            <FormattedMessage
              id="projectActions.confirmDeleteProject"
              defaultMessage="Are you sure you want to delete this list? All its items will still be accessible through the 'All items' list."
            />
          </h2>
          <p style={{ margin: `${units(4)} 0` }}>
            <Checkbox
              id="project-actions__confirm-delete"
              onCheck={this.handleConfirmation.bind(this)}
              checked={this.state.projectDeletionConfirmed}
              label={
                <FormattedMessage
                  id="projectActions.yes"
                  defaultMessage="Yes"
                />
              }
            />
          </p>
        </Dialog>
        {
          this.state.openAssignPopup ?
            <ProjectAssignment
              anchorEl={this.state.anchorEl}
              onDismiss={this.handleAssignClose}
              project={project}
            />
            : null
        }
      </Can>
      : null;
  }
}

ProjectActions.contextTypes = {
  store: PropTypes.object,
  setMessage: PropTypes.func,
};

export default injectIntl(ProjectActions);
