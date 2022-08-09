import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { commitMutation, graphql } from 'react-relay/compat';
import Box from '@material-ui/core/Box';
import ShortTextIcon from '@material-ui/icons/ShortText';
import LocationIcon from '@material-ui/icons/LocationOn';
import DateRangeIcon from '@material-ui/icons/DateRange';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import IconFileUpload from '@material-ui/icons/CloudUpload';
import LinkOutlinedIcon from '@material-ui/icons/LinkOutlined';
import TeamTaskConfirmDialog from './TeamTaskConfirmDialog';
import TeamTaskCard from './TeamTaskCard';
import TeamTaskContainer from './TeamTaskContainer';
import { withSetFlashMessage } from '../FlashMessage';
import Reorder from '../layout/Reorder';
import ConditionalField from '../task/ConditionalField';
import EditTaskDialog from '../task/EditTaskDialog';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import UpdateTeamTaskMutation from '../../relay/mutations/UpdateTeamTaskMutation';
import DeleteTeamTaskMutation from '../../relay/mutations/DeleteTeamTaskMutation';
import { getErrorMessage } from '../../helpers';
import NumberIcon from '../../icons/NumberIcon';

function submitMoveTeamTaskUp({
  task,
  onFailure,
}) {
  commitMutation(Relay.Store, {
    mutation: graphql`
      mutation TeamTasksListItemMoveTaskUpMutation($input: MoveTeamTaskUpInput!) {
        moveTeamTaskUp(input: $input) {
          team {
            team_tasks(fieldset: "metadata", first: 10000) {
              edges {
                node {
                  id
                  label
                  order
                  tasks_count
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
  task,
  onFailure,
}) {
  commitMutation(Relay.Store, {
    mutation: graphql`
      mutation TeamTasksListItemMoveTaskDownMutation($input: MoveTeamTaskDownInput!) {
        moveTeamTaskDown(input: $input) {
          team {
            team_tasks(fieldset: "metadata", first: 10000) {
              edges {
                node {
                  id
                  label
                  order
                  tasks_count
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

function submitTask({
  task,
  onFailure,
}) {
  commitMutation(Relay.Store, {
    mutation: graphql`
      mutation TeamTasksListItemUpdateTeamTaskMutation($input: UpdateTeamTaskInput!) {
        updateTeamTask(input: $input) {
          team {
            team_tasks(fieldset: "metadata", first: 10000) {
              edges {
                node {
                  id
                  label
                  order
                  tasks_count
                }
              }
            }
          }
        }
      }
    `,
    variables: {
      input: {
        ...task,
      },
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
      dialogOpen: false,
      editLabelOrDescription: false,
      showInBrowserExtension: !!this.props.task?.show_in_browser_extension,
      required: !!this.props.task?.required,
    };
  }

  setShowInBrowserExtension = (value) => {
    this.setState({ showInBrowserExtension: value });
    this.handleSubmitToggle({ showInBrowserExtension: value });
  }

  setRequired = (value) => {
    this.setState({ required: value });
    this.handleSubmitToggle({ required: value });
  }

  fail = (transaction) => {
    const message = getErrorMessage(transaction, <GenericUnknownErrorMessage />);
    this.props.setFlashMessage(message, 'error');
  };

  handleMenuEdit = () => {
    this.setState({ isEditing: true, action: 'edit' });
  };

  handleMenuDelete = () => {
    this.setState({ dialogOpen: true, action: 'delete' });
  };

  handleConfirmDialog = (keepCompleted) => {
    this.handleCloseDialog();
    if (this.state.action === 'delete') {
      this.handleDestroy(keepCompleted);
    }
  }

  handleEdit = (editedTask) => {
    this.setState(
      { isEditing: false, editedTask },
      this.handleSubmitTask,
    );
  };

  handleDestroy = (keepCompleted) => {
    const { task } = this.props;
    // FIXME Update to RelayModern mutation
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
    this.setState({ dialogOpen: false });
  };

  handleCloseEdit = () => {
    this.setState({ action: null, isEditing: false });
  };

  handleSubmitTask = () => {
    const task = this.state.editedTask;
    const { id } = this.props.task;

    const teamTask = {
      id,
      task_type: task.type,
      label: task.label,
      description: task.description,
      show_in_browser_extension: this.state.showInBrowserExtension,
      required: this.state.required,
      json_options: task.jsonoptions,
      json_schema: task.jsonschema,
    };

    const onSuccess = () => {
      this.handleCloseEdit();
      this.setState({ editedTask: null });
    };
    // FIXME Update to RelayModern mutation
    Relay.Store.commitUpdate(
      new UpdateTeamTaskMutation({
        team: this.props.team,
        teamTask,
      }),
      { onSuccess, onFailure: this.fail },
    );
  };

  handleSubmitToggle = (newValues) => {
    const { task } = this.props;
    const teamTask = {
      id: task.id,
      label: task.label,
      show_in_browser_extension: newValues.showInBrowserExtension !== undefined ? newValues.showInBrowserExtension : task.show_in_browser_extension,
      required: newValues.required !== undefined ? newValues.required : task.required,
    };

    const onSuccess = () => {
      this.handleCloseEdit();
    };
    // FIXME Update to RelayModern mutation
    Relay.Store.commitUpdate(
      new UpdateTeamTaskMutation({
        team: this.props.team,
        teamTask,
      }),
      { onSuccess, onFailure: this.fail },
    );
  };

  handleMoveTaskUp = () => {
    const { task } = this.props;

    submitMoveTeamTaskUp({
      task,
      onFailure: this.fail,
    });
  }

  handleMoveTaskDown = () => {
    const { task } = this.props;

    submitMoveTeamTaskDown({
      task,
      onFailure: this.fail,
    });
  };

  handleConditionChange = (value) => {
    submitTask({
      task: value,
      onFailure: this.fail,
    });
  };

  render() {
    const { task } = this.props;

    const icon = {
      free_text: <ShortTextIcon />,
      number: <NumberIcon />,
      geolocation: <LocationIcon />,
      datetime: <DateRangeIcon />,
      single_choice: <RadioButtonCheckedIcon />,
      multiple_choice: <CheckBoxIcon style={{ transform: 'scale(1,1)' }} />,
      file_upload: <IconFileUpload />,
      url: <LinkOutlinedIcon />,
    };

    return (
      <React.Fragment>
        <Box display="flex" alignItems="center" className="team-tasks__list-item">
          <Reorder onMoveUp={this.handleMoveTaskUp} onMoveDown={this.handleMoveTaskDown} />
          <TeamTaskCard
            icon={icon[task.type]}
            task={this.props.task}
            index={this.props.index}
            onEdit={this.handleMenuEdit}
            onDelete={this.handleMenuDelete}
            showInBrowserExtension={this.state.showInBrowserExtension}
            setShowInBrowserExtension={this.setShowInBrowserExtension}
            required={this.state.required}
            setRequired={this.setRequired}
            about={this.props.about}
          >
            <ConditionalField
              task={this.props.task}
              tasks={this.props.tasks}
              onChange={this.handleConditionChange}
            />
          </TeamTaskCard>
          { this.state.dialogOpen ?
            <TeamTaskContainer task={task} team={this.props.team}>
              {teamTask => (
                <TeamTaskConfirmDialog
                  editedTask={this.state.editedTask}
                  editLabelOrDescription={this.state.editLabelOrDescription}
                  task={teamTask}
                  open={this.state.dialogOpen}
                  action={this.state.action}
                  handleClose={this.handleCloseDialog}
                  handleConfirm={this.handleConfirmDialog}
                />
              )}
            </TeamTaskContainer> : null }
          { this.state.isEditing ?
            <TeamTaskContainer task={task} team={this.props.team}>
              {teamTask => (
                <EditTaskDialog
                  taskType={teamTask.type}
                  onDismiss={this.handleCloseEdit}
                  onSubmit={this.handleEdit}
                  task={teamTask}
                />
              )}
            </TeamTaskContainer> : null }
        </Box>
      </React.Fragment>
    );
  }
}


TeamTasksListItem.propTypes = {
  index: PropTypes.number.isRequired,
  task: PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    description: PropTypes.string,
    show_in_browser_extension: PropTypes.bool,
    type: PropTypes.string.isRequired,
    json_options: PropTypes.string,
    json_schema: PropTypes.string,
    tasks_count: PropTypes.number,
  }).isRequired,
  tasks: PropTypes.array.isRequired,
  team: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
  about: PropTypes.object.isRequired,
};

export default withSetFlashMessage(TeamTasksListItem);
