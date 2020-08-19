import React from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import ShortTextIcon from '@material-ui/icons/ShortText';
import LocationIcon from '@material-ui/icons/LocationOn';
import DateRangeIcon from '@material-ui/icons/DateRange';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import IconImageUpload from '@material-ui/icons/CloudUpload';
import TeamTaskConfirmDialog from './TeamTaskConfirmDialog';
import EditTaskDialog from '../task/EditTaskDialog';
import UpdateTeamTaskMutation from '../../relay/mutations/UpdateTeamTaskMutation';
import DeleteTeamTaskMutation from '../../relay/mutations/DeleteTeamTaskMutation';
import { getErrorMessage } from '../../helpers';

const messages = defineMessages({
  editError: {
    id: 'createTeamTask.editError',
    defaultMessage: 'Failed to edit default task',
  },
  deleteError: {
    id: 'createTeamTask.deleteError',
    defaultMessage: 'Failed to delete default task',
  },
  menuTooltip: {
    id: 'createTeamTask.menuTooltip',
    defaultMessage: 'Task actions',
  },
});

class TeamTasksListItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      action: null,
      message: null,
      anchorEl: null,
      dialogOpen: false,
      editLabelOrDescription: false,
    };
  }

  fail = (transaction) => {
    const fallbackMessage = this.props.intl.formatMessage(messages.deleteError);
    const message = getErrorMessage(transaction, fallbackMessage);
    this.setState({ message });
  };

  handleMenuClick = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleCloseMenu = () => {
    this.setState({ anchorEl: null });
  };

  handleMenuEdit = () => {
    this.setState({ isEditing: true, action: 'edit' });
    this.handleCloseMenu();
  };

  handleMenuDelete = () => {
    this.setState({ dialogOpen: true, action: 'delete' });
    this.handleCloseMenu();
  };

  handleConfirmDialog = (keepCompleted) => {
    this.handleCloseDialog();
    if (this.state.action === 'delete') {
      this.handleDestroy(keepCompleted);
    } else if (this.state.action === 'edit') {
      this.handleSubmitTask(keepCompleted);
    }
  }

  handleEdit = (editedTask) => {
    this.setState({
      isEditing: false,
      editedTask,
      editLabelOrDescription: editedTask.editLabelOrDescription,
      dialogOpen: true,
    });
  };

  handleDestroy = (keepCompleted) => {
    const { task } = this.props;

    Relay.Store.commitUpdate(
      new DeleteTeamTaskMutation({
        teamId: this.props.team.id,
        id: task.id,
        keepCompleted,
      }),
      { onFailure: this.fail },
    );
  };

  handleCloseDialog = () => {
    this.setState({ dialogOpen: false, message: null });
  };

  handleCloseEdit = () => {
    this.setState({ action: null, isEditing: false, message: null });
  };

  handleSubmitTask = (keepCompleted) => {
    const task = this.state.editedTask;
    const { id, type } = this.props.task;
    const teamTask = {
      id,
      task_type: type,
      label: task.label,
      description: task.description,
      json_options: task.jsonoptions,
      json_project_ids: task.json_project_ids,
      json_schema: task.jsonschema,
      keep_completed_tasks: keepCompleted,
    };

    const onSuccess = () => {
      this.handleCloseEdit();
      this.setState({ editedTask: null });
    };

    Relay.Store.commitUpdate(
      new UpdateTeamTaskMutation({
        team: this.props.team,
        teamTask,
      }),
      { onSuccess, onFailure: this.fail },
    );
  };

  render() {
    const { team, task } = this.props;
    const projects = team.projects ? team.projects.edges : null;
    const selectedProjects = task ? task.project_ids : [];
    const { anchorEl } = this.state;

    const icon = {
      free_text: <ShortTextIcon />,
      geolocation: <LocationIcon />,
      datetime: <DateRangeIcon />,
      single_choice: <RadioButtonCheckedIcon />,
      multiple_choice: <CheckBoxIcon style={{ transform: 'scale(1,1)' }} />,
      image_upload: <IconImageUpload />,
    };

    const label = (
      <span>
        {task.label}
      </span>
    );

    return (
      <div>
        <ListItem className="team-tasks__list-item">
          <ListItemIcon className="team-tasks__task-icon">
            {icon[task.type]}
          </ListItemIcon>
          <ListItemText className="team-tasks__task-label" primary={label} />
          <ListItemSecondaryAction>
            <Tooltip title={this.props.intl.formatMessage(messages.menuTooltip)}>
              <IconButton className="team-tasks__menu-item-button" onClick={this.handleMenuClick}>
                <MoreHorizIcon />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={this.handleCloseMenu}
            >
              <MenuItem className="team-tasks__edit-button" onClick={this.handleMenuEdit}>
                <FormattedMessage id="teamTasks.edit" defaultMessage="Edit" />
              </MenuItem>
              <MenuItem className="team-tasks__delete-button" onClick={this.handleMenuDelete}>
                <FormattedMessage id="teamTasks.delete" defaultMessage="Delete" />
              </MenuItem>
            </Menu>
          </ListItemSecondaryAction>
        </ListItem>
        <TeamTaskConfirmDialog
          projects={projects}
          selectedProjects={selectedProjects}
          editedTask={this.state.editedTask}
          editLabelOrDescription={this.state.editLabelOrDescription}
          open={this.state.dialogOpen}
          action={this.state.action}
          handleClose={this.handleCloseDialog}
          handleConfirm={this.handleConfirmDialog}
          message={this.state.message}
        />
        { this.state.isEditing ?
          <EditTaskDialog
            task={task}
            message={this.state.message}
            taskType={task.type}
            onDismiss={this.handleCloseEdit}
            onSubmit={this.handleEdit}
            projects={projects}
          />
          : null
        }
      </div>
    );
  }
}

export default injectIntl(TeamTasksListItem);
