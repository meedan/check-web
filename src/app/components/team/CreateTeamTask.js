import React from 'react';
import Relay from 'react-relay/classic';
import CreateTaskMenu from '../task/CreateTaskMenu';
import EditTaskDialog from '../task/EditTaskDialog';
import CreateTeamTaskMutation from '../../relay/mutations/CreateTeamTaskMutation';

class CreateTeamTask extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      createType: null,
    };
  }

  handleSelectType = (createType) => {
    this.setState({ createType });
  };

  handleClose = () => {
    this.setState({ createType: null });
  }

  handleSubmitTask = (task) => {
    const teamTask = {
      label: task.label,
      description: task.description,
      required: Boolean(task.required),
      task_type: this.state.createType,
      json_options: task.jsonoptions,
      json_project_ids: task.json_project_ids,
    };

    const onSuccess = () => {
      this.handleClose();
    };

    const onFailure = () => {
      // TODO: handle error
    };

    Relay.Store.commitUpdate(
      new CreateTeamTaskMutation({
        team: this.props.team,
        teamTask,
      }),
      { onSuccess, onFailure },
    );
  };

  render() {
    return (
      <div>
        <CreateTaskMenu onSelect={this.handleSelectType} hideTeamwideOption />
        { this.state.createType ?
          <EditTaskDialog
            taskType={this.state.createType}
            onDismiss={this.handleClose}
            onSubmit={this.handleSubmitTask}
            projects={this.props.team.projects.edges}
          />
          : null
        }
      </div>
    );
  }
}

export default CreateTeamTask;
