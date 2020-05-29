import React from 'react';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import MoreHoriz from '@material-ui/icons/MoreHoriz';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { can } from '../Can';

const messages = defineMessages({
  menuTooltip: {
    id: 'taskActions.menuTooltip',
    defaultMessage: 'Task actions',
  },
});

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
    const { anchorEl } = this.state;

    if (task.cannotAct) {
      return null;
    }

    if (!can(task.permissions, 'update Task')) {
      return null;
    }

    return (
      <React.Fragment>
        <Tooltip title={this.props.intl.formatMessage(messages.menuTooltip)}>
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
          {can(media.permissions, 'create Task') ? (
            <MenuItem className="task-actions__edit" onClick={() => this.handleAction('edit_question')}>
              <FormattedMessage id="task.edit" defaultMessage="Edit task" />
            </MenuItem>
          ) : null}

          {(response && can(task.first_response.permissions, 'update Dynamic')) ? [
            (
              <MenuItem className="task-actions__edit-response" onClick={() => this.handleAction('edit_response', task.first_response)}>
                <FormattedMessage id="task.editResponse" defaultMessage="Edit answer" />
              </MenuItem>
            ), (
              <MenuItem className="task-actions__delete-response" onClick={() => this.handleAction('delete_response', task.first_response)}>
                <FormattedMessage id="task.deleteResponse" defaultMessage="Delete answer" />
              </MenuItem>
            ),
          ] : null}

          {(can(media.permissions, 'create Task')) ? (
            <MenuItem className="task-actions__assign" onClick={() => this.handleAction('edit_assignment')}>
              <FormattedMessage id="task.assignOrUnassign" defaultMessage="Assign / Unassign" />
            </MenuItem>
          ) : null}

          {(response && can(task.first_response.permissions, 'update Dynamic')) ?
            <MenuItem className="task-actions__edit-attribution" onClick={() => this.handleAction('edit_attribution')}>
              <FormattedMessage id="task.editAttribution" defaultMessage="Edit attribution" />
            </MenuItem>
            : null}

          {can(task.permissions, 'destroy Task') ? (
            <MenuItem className="task-actions__delete" onClick={() => this.handleAction('delete')}>
              <FormattedMessage id="task.delete" defaultMessage="Delete task" />
            </MenuItem>
          ) : null}
        </Menu>
      </React.Fragment>
    );
  }
}

export default injectIntl(TaskActions);
