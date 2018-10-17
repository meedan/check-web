import React from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
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

class TeamTasksListItem extends React.Component {
  state = {
    anchorEl: null,
    confirmed: false,
    dialogOpen: false,
    editedTask: null,
  };

  handleMenuClick = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleCloseMenu = () => {
    this.setState({ anchorEl: null });
  };

  handleMenuEdit = (index) => {
    this.setState({
      dialogOpen: true,
      action: 'edit',
      editTaskIndex: index,
    });
    this.handleCloseMenu();
  };

  handleMenuDelete = (index) => {
    this.setState({
      dialogOpen: true,
      action: 'delete',
      deleteTaskIndex: index,
    });
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
    const index = this.state.editTaskIndex;
    this.setState({
      editedTask: this.props.team.team_tasks.edges[index],
    });
    this.handleCloseDialog();
  };

  handleDestroy = () => {
    const team_tasks = this.props.team.team_tasks.edges;
    const task = team_tasks[this.state.deleteTaskIndex];

    const onSuccess = () => {
      this.handleCloseDialog();
    };

    const onFailure = () => {
      // TODO: handle error
    };

    Relay.Store.commitUpdate(
      new DeleteTeamTaskMutation({
        teamId: this.props.team.id,
        id: task.node.id,
      }),
      { onSuccess, onFailure },
    );
  };

  handleCloseDialog = () => {
    this.setState({ dialogOpen: false, confirmed: false });
  };

  handleConfirmation = () => {
    this.setState({ confirmed: !this.state.confirmed });
  };

  handleCloseEdit = () => {
    this.setState({ editedTask: null });
  };

  handleSubmitTask = (task) => {
    const teamTask = {
      id: this.state.editedTask.node.id,
      label: task.label,
      description: task.description,
      required: Boolean(task.required),
      task_type: this.state.editedTask.node.task_type,
      json_options: task.jsonoptions,
      json_project_ids: task.json_project_ids,
    };

    const onSuccess = () => {
      this.handleCloseEdit();
    };

    const onFailure = () => {
      // TODO: handle error
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
    const { task, index } = this.props.taskContainer;
    const { anchorEl, editedTask } = this.state;

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
              id="simple-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={this.handleCloseMenu}
            >
              <MenuItem onClick={() => this.handleMenuEdit(index)}>
                <FormattedMessage id="teamTasks.edit" defaultMessage="Edit task" />
              </MenuItem>
              <MenuItem onClick={() => this.handleMenuDelete(index)}>
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
            <Message message={this.state.message} />
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

        { editedTask ?
          <EditTaskDialog
            task={editedTask}
            taskType={editedTask.node.task_type}
            onDismiss={this.handleCloseEdit}
            onSubmit={this.handleSubmitTask}
            projects={this.props.team.projects.edges}
            noAssign
          /> : null
        }
      </div>
    );
  }
}

export default TeamTasksListItem;
