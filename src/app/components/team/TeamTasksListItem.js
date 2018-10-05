import React from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import Checkbox from 'material-ui/Checkbox';
import Dialog from 'material-ui/Dialog';
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
import CreateOptionsTask from '../task/CreateOptionsTask';
import { RequiredIndicator } from '../task/Task';
import { units } from '../../styles/js/shared';
import UpdateTeamMutation from '../../relay/mutations/UpdateTeamMutation';

class TeamTasksListItem extends React.Component {
  state = {
    anchorEl: null,
    confirmed: false,
    dialogOpen: false,
    editedTask: null,
  };

  handleClick = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleCloseMenu = () => {
    this.setState({ anchorEl: null });
  };

  handleEdit = (index) => {
    this.setState({
      editedTask: this.props.team.checklist[index],
    });
    this.handleCloseMenu();
  };

  handleDelete = (index) => {
    this.setState({ dialogOpen: true, deleteTaskIndex: index });
    this.handleCloseMenu();
  };

  handleDestroy = () => {
    const newChecklist = [...this.props.team.checklist];

    newChecklist.splice(this.state.deleteTaskIndex, 1);

    const team_tasks = JSON.stringify(newChecklist);

    const onSuccess = () => {
      this.handleCloseDialog();
    };

    const onFailure = () => {
      // TODO: handle error
    };

    Relay.Store.commitUpdate(
      new UpdateTeamMutation({
        id: this.props.team.id,
        team_tasks,
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
    const {
      label,
      description,
      required,
      jsonoptions,
    } = task;

    const newTeamTask = {
      label,
      description,
      required: required ? '1' : '0',
      type: this.state.editedTask.type,
      // mapping: {
      //   type: 'text',
      //   match: '',
      //   prefix: '',
      // },
      projects: [],
      options: JSON.parse(jsonoptions),
    };

    const checklist = [...this.props.team.checklist];
    const { index } = this.props.taskContainer;

    checklist.splice(index, 1, newTeamTask);

    this.submitChecklist(checklist);
  };

  submitChecklist = (checklist) => {
    const team_tasks = JSON.stringify(checklist);

    const onSuccess = () => {
      this.handleCloseEdit();
    };

    const onFailure = () => {
      // TODO: handle error
    };

    Relay.Store.commitUpdate(
      new UpdateTeamMutation({
        id: this.props.team.id,
        team_tasks,
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

    const actions = [
      <FlatButton
        label={<FormattedMessage id="teamTasks.cancelDelete" defaultMessage="Cancel" />}
        onClick={this.handleCloseDialog}
      />,
      <FlatButton
        id="team-tasks__confirm-delete-button"
        label={<FormattedMessage id="teamTasks.continue" defaultMessage="Continue" />}
        primary
        keyboardFocused
        onClick={this.handleDestroy}
        disabled={!this.state.confirmed}
      />,
    ];

    return (
      <div>
        <ListItem>
          <ListItemIcon>
            {icon[task.type]}
          </ListItemIcon>
          <ListItemText primary={label} />
          <ListItemSecondaryAction>
            <IconButton onClick={this.handleClick}>
              <MoreHorizIcon />
            </IconButton>
            <Menu
              id="simple-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={this.handleCloseMenu}
            >
              <MenuItem onClick={() => this.handleEdit(index)}>
                <FormattedMessage id="teamTasks.edit" defaultMessage="Edit task" />
              </MenuItem>
              <MenuItem onClick={() => this.handleDelete(index)}>
                <FormattedMessage id="teamTasks.delete" defaultMessage="Delete task" />
              </MenuItem>
            </Menu>
          </ListItemSecondaryAction>
        </ListItem>

        <Dialog
          actions={actions}
          modal={false}
          open={this.state.dialogOpen}
          onRequestClose={this.handleCloseDialog}
        >
          <Message message={this.state.message} />
          <h2>
            <FormattedMessage
              id="teamTasks.confirmDeleteTitle"
              defaultMessage="Are you sure you want to delete this task?"
            />
          </h2>
          <div style={{ margin: `${units(4)} 0` }}>
            <Checkbox
              id="team-tasks__confirm-delete-checkbox"
              onCheck={this.handleConfirmation.bind(this)}
              checked={this.state.confirmed}
              label={<FormattedMessage id="teamTasks.confirmDelete" defaultMessage="Yes" />}
            />
          </div>
        </Dialog>

        { editedTask ?
          <CreateOptionsTask
            task={editedTask}
            taskType={editedTask.type}
            onDismiss={this.handleCloseEdit}
            onSubmit={this.handleSubmitTask}
            noAssign
          /> : null
        }
      </div>
    );
  }
}

export default TeamTasksListItem;
