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
import TeamTaskConfirmDialog from './TeamTaskConfirmDialog';
import TeamTaskCard from './TeamTaskCard';
import Reorder from '../layout/Reorder';
import ConditionalField from '../task/ConditionalField';
import EditTaskDialog from '../task/EditTaskDialog';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import UpdateTeamTaskMutation from '../../relay/mutations/UpdateTeamTaskMutation';
import DeleteTeamTaskMutation from '../../relay/mutations/DeleteTeamTaskMutation';
import { getErrorMessage } from '../../helpers';
import NumberIcon from '../../icons/NumberIcon';

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

function submitTask({
  task,
  fieldset,
  onFailure,
}) {
  commitMutation(Relay.Store, {
    mutation: graphql`
      mutation TeamTasksListItemUpdateTeamTaskMutation($input: UpdateTeamTaskInput!, $fieldset: String!) {
        updateTeamTask(input: $input) {
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
        ...task,
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
      dialogOpen: false,
      editLabelOrDescription: false,
      showInBrowserExtension: this.props.task?.show_in_browser_extension,
      required: this.props.task?.required,
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
    this.setState({ message });
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
      show_in_browser_extension: this.state.showInBrowserExtension,
      required: this.state.required,
      json_options: task.jsonoptions,
      json_project_ids: task.json_project_ids,
      json_schema: task.jsonschema,
      keep_completed_tasks: keepCompleted,
    };
    // eslint-disable-next-line
    console.log('~~teamtask', teamTask);

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

  handleSubmitToggle = (newValues) => {
    const { task } = this.props;
    const teamTask = {
      id: task.id,
      label: task.label,
      show_in_browser_extension: newValues.showInBrowserExtension !== undefined ? newValues.showInBrowserExtension : task.show_in_browser_extension,
      required: newValues.required !== undefined ? newValues.required : task.required,
    };
    // eslint-disable-next-line
    console.log('~~YO', teamTask, newValues);

    const onSuccess = () => {
      this.handleCloseEdit();
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

  handleConditionChange = (value) => {
    const { fieldset } = this.props;

    submitTask({
      fieldset,
      task: value,
      onFailure: this.fail,
    });
  };

  render() {
    const { task, team } = this.props;
    const projects = team.projects ? team.projects.edges : null;
    const selectedProjects = task ? task.project_ids : [];

    const icon = {
      free_text: <ShortTextIcon />,
      number: <NumberIcon />,
      geolocation: <LocationIcon />,
      datetime: <DateRangeIcon />,
      single_choice: <RadioButtonCheckedIcon />,
      multiple_choice: <CheckBoxIcon style={{ transform: 'scale(1,1)' }} />,
      file_upload: <IconFileUpload />,
    };

    return (
      <React.Fragment>
        <Box display="flex" alignItems="center">
          <Reorder onMoveUp={this.handleMoveTaskUp} onMoveDown={this.handleMoveTaskDown} />
          <TeamTaskCard
            icon={icon[task.type]}
            task={this.props.task}
            onEdit={this.handleMenuEdit}
            onDelete={this.handleMenuDelete}
            showInBrowserExtension={this.state.showInBrowserExtension}
            setShowInBrowserExtension={this.setShowInBrowserExtension}
            required={this.state.required}
            setRequired={this.setRequired}
          >
            <ConditionalField
              task={this.props.task}
              tasks={this.props.tasks}
              onChange={this.handleConditionChange}
            />
          </TeamTaskCard>
          <TeamTaskConfirmDialog
            fieldset={this.props.fieldset}
            projects={projects}
            selectedProjects={selectedProjects}
            editedTask={this.state.editedTask}
            editLabelOrDescription={this.state.editLabelOrDescription}
            open={this.state.dialogOpen}
            task={task}
            action={this.state.action}
            handleClose={this.handleCloseDialog}
            handleConfirm={this.handleConfirmDialog}
            message={this.state.message}
          />
          { this.state.isEditing ?
            <EditTaskDialog
              fieldset={this.props.fieldset}
              task={task}
              tasks={this.props.tasks}
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
      </React.Fragment>
    );
  }
}

TeamTasksListItem.propTypes = {
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

export default (TeamTasksListItem);
