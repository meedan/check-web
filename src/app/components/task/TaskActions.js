import React from 'react';
import { FormattedMessage } from 'react-intl';
import MoreHoriz from '@material-ui/icons/MoreHoriz';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { can } from '../Can';

class TaskActions extends React.Component {
  state = {
    anchorEl: null,
  };

  handleMenuClick = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => { this.setState({ anchorEl: null }); };

  handleAction = (action, value) => {
    this.setState({ anchorEl: null }, () => {
      if (this.props.onSelect) {
        this.props.onSelect(action, value);
      }
    });
  };

  render() {
    const { task, media, response } = this.props;
    const isTask = task.fieldset === 'tasks';
    const { anchorEl } = this.state;
    const isBrowserExtension = (window.parent !== window);

    if (task.cannotAct) {
      return null;
    }

    if (!can(task.permissions, 'update Task')) {
      return null;
    }

    const menuItems = [];
    const menuTooltip = isTask ? (
      <FormattedMessage id="taskActions.tooltipTask" defaultMessage="Task actions" />
    ) : (
      <FormattedMessage id="taskActions.tooltipMetadata" defaultMessage="Metadata actions" />
    );

    if (can(media.permissions, 'create Task') && isTask && !isBrowserExtension && !task.team_task_id) {
      menuItems.push((
        <MenuItem
          key="edit"
          className="task-actions__edit"
          onClick={() => this.handleAction('edit_question')}
        >
          <FormattedMessage id="task.edit" defaultMessage="Edit task" />
        </MenuItem>
      ));
    }

    if (response && can(task.first_response.permissions, 'update Dynamic')) {
      menuItems.push((
        <MenuItem
          key="edit-answer"
          className="task-actions__edit-response"
          onClick={() => this.handleAction('edit_response', task.first_response)}
        >
          <FormattedMessage id="task.editResponse" defaultMessage="Edit answer" />
        </MenuItem>
      ));

      menuItems.push((
        <MenuItem
          key="delete-answer"
          className="task-actions__delete-response"
          onClick={() => this.handleAction('delete_response', task.first_response)}
        >
          <FormattedMessage id="task.deleteResponse" defaultMessage="Delete answer" />
        </MenuItem>
      ));
    }

    if (can(media.permissions, 'create Task') && isTask && !isBrowserExtension) {
      menuItems.push((
        <MenuItem
          key="edit-assignment"
          className="task-actions__assign"
          onClick={() => this.handleAction('edit_assignment')}
        >
          <FormattedMessage id="task.assignOrUnassign" defaultMessage="Assign / Unassign" />
        </MenuItem>
      ));
    }

    if (response && can(task.first_response.permissions, 'update Dynamic') && isTask && !isBrowserExtension) {
      menuItems.push((
        <MenuItem
          key="edit-attribution"
          className="task-actions__edit-attribution"
          onClick={() => this.handleAction('edit_attribution')}
        >
          <FormattedMessage id="task.editAttribution" defaultMessage="Edit attribution" />
        </MenuItem>
      ));
    }

    if (can(task.permissions, 'destroy Task') && isTask) {
      menuItems.push((
        <MenuItem
          key="delete"
          className="task-actions__delete"
          onClick={() => this.handleAction('delete')}
        >
          <FormattedMessage id="task.delete" defaultMessage="Delete task" />
        </MenuItem>
      ));
    }

    return menuItems.length ? (
      <React.Fragment>
        <Tooltip title={menuTooltip}>
          <IconButton className="task-actions__icon" onClick={this.handleMenuClick}>
            <MoreHoriz />
          </IconButton>
        </Tooltip>
        <Menu
          className="task-actions"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
        >
          {menuItems}
        </Menu>
      </React.Fragment>
    ) : null;
  }
}

export default TaskActions;
