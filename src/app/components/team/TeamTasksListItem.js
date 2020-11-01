import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { commitMutation, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
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
import IconFileUpload from '@material-ui/icons/CloudUpload';
import { withStyles } from '@material-ui/core/styles';
import TeamTaskConfirmDialog from './TeamTaskConfirmDialog';
import Reorder from '../layout/Reorder';
import EditTaskDialog from '../task/EditTaskDialog';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import UpdateTeamTaskMutation from '../../relay/mutations/UpdateTeamTaskMutation';
import DeleteTeamTaskMutation from '../../relay/mutations/DeleteTeamTaskMutation';
import { getErrorMessage } from '../../helpers';
import { black16 } from '../../styles/js/shared';

const styles = theme => ({
  container: {
    border: `2px solid ${black16}`,
    borderRadius: '5px',
    width: '100%',
    margin: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    marginLeft: 0,
    height: theme.spacing(12),
    display: 'flex',
    alignItems: 'center',
  },
});

function submitMoveTeamTaskUp({
  fieldset,
  task,
  onFailure,
}) {
  commitMutation(Relay.Store, {
    mutation: graphql`
      mutation TeamTasksListItemMoveTaskUpMutation($input: MoveTeamTaskUpInput!, $fieldset: String!) {
        moveTeamTaskUp(input: $input) {
          team {
            team_tasks(fieldset: $fieldset, first: 10000) {
              edges {
                node {
                  id
                  label
                  order
                }
              }
            }
          }
        }
      }
    `,
    variables: {
      input: {
        id: task.id,
      },
      fieldset,
    },
    onError: onFailure,
    onCompleted: ({ errors }) => {
      if (errors) {
        return onFailure(errors);
      }
      return null;
    },
  });
}

function submitMoveTeamTaskDown({
  fieldset,
  task,
  onFailure,
}) {
  commitMutation(Relay.Store, {
    mutation: graphql`
      mutation TeamTasksListItemMoveTaskDownMutation($input: MoveTeamTaskDownInput!, $fieldset: String!) {
        moveTeamTaskDown(input: $input) {
          team {
            team_tasks(fieldset: $fieldset, first: 10000) {
              edges {
                node {
                  id
                  label
                  order
                }
              }
            }
          }
        }
      }
    `,
    variables: {
      input: {
        id: task.id,
      },
      fieldset,
    },
    onError: onFailure,
    onCompleted: ({ errors }) => {
      if (errors) {
        return onFailure(errors);
      }
      return null;
    },
  });
}

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
    const message = getErrorMessage(transaction, <GenericUnknownErrorMessage />);
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
      show_in_browser_extension: task.show_in_browser_extension,
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

  handleMoveTaskUp = () => {
    const { task, fieldset } = this.props;

    submitMoveTeamTaskUp({
      fieldset,
      task,
      onFailure: this.fail,
    });
  }

  handleMoveTaskDown = () => {
    const { task, fieldset } = this.props;

    submitMoveTeamTaskDown({
      fieldset,
      task,
      onFailure: this.fail,
    });
  };

  render() {
    const { classes, task, team } = this.props;
    const projects = team.projects ? team.projects.edges : null;
    const selectedProjects = task ? task.project_ids : [];
    const { anchorEl } = this.state;

    const icon = {
      free_text: <ShortTextIcon />,
      geolocation: <LocationIcon />,
      datetime: <DateRangeIcon />,
      single_choice: <RadioButtonCheckedIcon />,
      multiple_choice: <CheckBoxIcon style={{ transform: 'scale(1,1)' }} />,
      file_upload: <IconFileUpload />,
    };

    const label = (
      <span>
        {task.label}
      </span>
    );

    const menuTooltip = this.props.fieldset === 'tasks' ? (
      <FormattedMessage id="taskActions.tooltipTask" defaultMessage="Task actions" />
    ) : (
      <FormattedMessage id="taskActions.tooltipMetadata" defaultMessage="Metadata actions" />
    );

    return (
      <Box display="flex" alignItems="center">
        <Reorder onMoveUp={this.handleMoveTaskUp} onMoveDown={this.handleMoveTaskDown} />
        <ListItem classes={{ container: classes.container }} className="team-tasks__list-item">
          <ListItemIcon className="team-tasks__task-icon">
            {icon[task.type]}
          </ListItemIcon>
          <ListItemText className="team-tasks__task-label" primary={label} />
          <ListItemSecondaryAction>
            <Tooltip title={menuTooltip}>
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
          fieldset={this.props.fieldset}
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
            fieldset={this.props.fieldset}
            task={task}
            message={this.state.message}
            taskType={task.type}
            onDismiss={this.handleCloseEdit}
            onSubmit={this.handleEdit}
            projects={projects}
            isTeamTask
          />
          : null
        }
      </Box>
    );
  }
}

TeamTasksListItem.propTypes = {
  classes: PropTypes.object.isRequired,
  task: PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    description: PropTypes.string,
    show_in_browser_extension: PropTypes.bool,
    type: PropTypes.string.isRequired,
    json_options: PropTypes.string,
    json_project_ids: PropTypes.string,
    json_schema: PropTypes.string,
  }).isRequired,
  team: PropTypes.shape({
    id: PropTypes.string.isRequired,
    projects: PropTypes.shape({
      edges: PropTypes.arrayOf((
        PropTypes.shape({
          node: PropTypes.shape({
            title: PropTypes.string.isRequired,
            dbid: PropTypes.number.isRequired,
          }),
        })
      )),
    }),
  }).isRequired,
  fieldset: PropTypes.string.isRequired,
};

export default withStyles(styles)(TeamTasksListItem);
