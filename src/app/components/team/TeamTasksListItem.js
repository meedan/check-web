/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { commitMutation, graphql } from 'react-relay/compat';
import Box from '@material-ui/core/Box';
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
import CheckBoxIcon from '../../icons/check_box.svg';
import IconFileUpload from '../../icons/file_upload.svg';
import DateRangeIcon from '../../icons/calendar_month.svg';
import NumberIcon from '../../icons/numbers.svg';
import LinkOutlinedIcon from '../../icons/link.svg';
import LocationIcon from '../../icons/location.svg';
import RadioButtonCheckedIcon from '../../icons/radio_button_checked.svg';
import ShortTextIcon from '../../icons/notes.svg';

function submitMoveTeamTaskUp({
  onFailure,
  task,
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
  onFailure,
  task,
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
  onFailure,
  task,
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
      options_diff: task.diff,
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
      multiple_choice: <CheckBoxIcon />,
      file_upload: <IconFileUpload />,
      url: <LinkOutlinedIcon />,
    };

    return (
      <React.Fragment>
        <Box alignItems="center" className="team-tasks__list-item" display="flex" style={{ gap: '10px' }}>
          <Reorder
            disableDown={this.props.isLast}
            disableUp={this.props.isFirst}
            theme="gray"
            variant="vertical"
            onMoveDown={this.handleMoveTaskDown}
            onMoveUp={this.handleMoveTaskUp}
          />
          <TeamTaskCard
            about={this.props.about}
            icon={icon[task.type]}
            index={this.props.index}
            required={this.state.required}
            setRequired={this.setRequired}
            setShowInBrowserExtension={this.setShowInBrowserExtension}
            showInBrowserExtension={this.state.showInBrowserExtension}
            task={this.props.task}
            onDelete={this.handleMenuDelete}
            onEdit={this.handleMenuEdit}
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
                  action={this.state.action}
                  editLabelOrDescription={this.state.editLabelOrDescription}
                  editedTask={this.state.editedTask}
                  handleClose={this.handleCloseDialog}
                  handleConfirm={this.handleConfirmDialog}
                  open={this.state.dialogOpen}
                  task={teamTask}
                />
              )}
            </TeamTaskContainer> : null }
          { this.state.isEditing ?
            <TeamTaskContainer task={task} team={this.props.team}>
              {teamTask => (
                <EditTaskDialog
                  task={teamTask}
                  taskType={teamTask.type}
                  onDismiss={this.handleCloseEdit}
                  onSubmit={this.handleEdit}
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
