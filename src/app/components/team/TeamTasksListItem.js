import React from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import Checkbox from 'material-ui/Checkbox';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import FlatButton from 'material-ui/FlatButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import ShortTextIcon from '@material-ui/icons/ShortText';
import LocationIcon from '@material-ui/icons/LocationOn';
import DateRangeIcon from '@material-ui/icons/DateRange';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import Message from '../Message';
import EditTaskDialog from '../task/EditTaskDialog';
import { RequiredIndicator } from '../task/Task';
import { units } from '../../styles/js/shared';
import UpdateTeamTaskMutation from '../../relay/mutations/UpdateTeamTaskMutation';
import DeleteTeamTaskMutation from '../../relay/mutations/DeleteTeamTaskMutation';
import { safelyParseJSON } from '../../helpers';

const messages = defineMessages({
  editError: {
    id: 'createTeamTask.editError',
    defaultMessage: 'Failed to edit teamwide task',
  },
  deleteError: {
    id: 'createTeamTask.deleteError',
    defaultMessage: 'Failed to delete teamwide task',
  },
});

class TeamTasksListItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      action: null,
      message: null,
      anchorEl: null,
      confirmed: false,
      dialogOpen: false,
    };
  }

  handleMenuClick = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleCloseMenu = () => {
    this.setState({ anchorEl: null });
  };

  handleMenuEdit = () => {
    this.setState({ dialogOpen: true, action: 'edit' });
    this.handleCloseMenu();
  };

  handleMenuDelete = () => {
    this.setState({ dialogOpen: true, action: 'delete' });
    this.handleCloseMenu();
  };

  handleConfirmDialog = () => {
    if (this.state.action === 'delete') {
      this.handleDestroy();
    } else if (this.state.action === 'edit') {
      this.handleEdit();
    }
  }

  handleEdit = () => {
    this.setState({ isEditing: true });
    this.handleCloseDialog();
  };

  handleDestroy = () => {
    const { task } = this.props;

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = this.props.intl.formatMessage(messages.deleteError);
      const json = safelyParseJSON(error.source);
      if (json && json.error) {
        message = json.error;
      }
      this.setState({ message });
    };

    Relay.Store.commitUpdate(
      new DeleteTeamTaskMutation({
        teamId: this.props.team.id,
        id: task.id,
      }),
      { onFailure },
    );
  };

  handleCloseDialog = () => {
    this.setState({ dialogOpen: false, confirmed: false, message: null });
  };

  handleConfirmation = () => {
    this.setState({ confirmed: !this.state.confirmed });
  };

  handleCloseEdit = () => {
    this.setState({ action: null, isEditing: false, message: null });
  };

  handleSubmitTask = (task) => {
    const { id, task_type } = this.props.task;
    const teamTask = {
      id,
      task_type,
      label: task.label,
      description: task.description,
      required: Boolean(task.required),
      json_options: task.jsonoptions,
      json_project_ids: task.json_project_ids,
    };

    const onSuccess = () => {
      this.handleCloseEdit();
    };

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = this.props.intl.formatMessage(messages.editError);
      const json = safelyParseJSON(error.source);
      if (json && json.error) {
        message = json.error;
      }
      this.setState({ message });
    };

    Relay.Store.commitUpdate(
      new UpdateTeamTaskMutation({
        team: this.props.team,
        teamTask,
      }),
      { onSuccess, onFailure },
    );
  };

  render() {
    const { task } = this.props;
    const { anchorEl } = this.state;

    const icon = {
      free_text: <ShortTextIcon />,
      geolocation: <LocationIcon />,
      datetime: <DateRangeIcon />,
      single_choice: <RadioButtonCheckedIcon />,
      multiple_choice: <CheckBoxIcon />,
    };

    const label = (
      <span>
        {task.label}
        <RequiredIndicator required={task.required} />
      </span>
    );

    return (
      <div>
        <ListItem>
          <ListItemIcon>
            {icon[task.task_type]}
          </ListItemIcon>
          <ListItemText primary={label} />
          <ListItemSecondaryAction>
            <IconButton onClick={this.handleMenuClick}>
              <MoreHorizIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={this.handleCloseMenu}
            >
              <MenuItem onClick={this.handleMenuEdit}>
                <FormattedMessage id="teamTasks.edit" defaultMessage="Edit task" />
              </MenuItem>
              <MenuItem onClick={this.handleMenuDelete}>
                <FormattedMessage id="teamTasks.delete" defaultMessage="Delete task" />
              </MenuItem>
            </Menu>
          </ListItemSecondaryAction>
        </ListItem>

        <Dialog
          open={this.state.dialogOpen}
          onClose={this.handleCloseDialog}
        >
          <DialogContent>
            <h2>
              { this.state.action === 'edit' ?
                <FormattedMessage
                  id="teamTasks.confirmEditTitle"
                  defaultMessage="Are you sure you want to edit this task?"
                /> : null
              }
              { this.state.action === 'delete' ?
                <FormattedMessage
                  id="teamTasks.confirmDeleteTitle"
                  defaultMessage="Are you sure you want to delete this task?"
                /> : null
              }
            </h2>
            <Message message={this.state.message} />
            <div style={{ margin: `${units(4)} 0` }}>
              <Checkbox
                id="team-tasks__confirm-delete-checkbox"
                onCheck={this.handleConfirmation.bind(this)}
                checked={this.state.confirmed}
                label={<FormattedMessage id="teamTasks.confirmDelete" defaultMessage="Yes" />}
              />
            </div>
          </DialogContent>
          <DialogActions>
            <FlatButton
              label={<FormattedMessage id="teamTasks.cancelDelete" defaultMessage="Cancel" />}
              onClick={this.handleCloseDialog}
            />
            <FlatButton
              id="team-tasks__confirm-delete-button"
              label={<FormattedMessage id="teamTasks.continue" defaultMessage="Continue" />}
              primary
              keyboardFocused
              onClick={this.handleConfirmDialog}
              disabled={!this.state.confirmed}
            />
          </DialogActions>
        </Dialog>

        { this.state.isEditing ?
          <EditTaskDialog
            task={task}
            message={this.state.message}
            taskType={task.task_type}
            onDismiss={this.handleCloseEdit}
            onSubmit={this.handleSubmitTask}
            projects={this.props.team.projects.edges}
          /> : null
        }
      </div>
    );
  }
}

export default injectIntl(TeamTasksListItem);
