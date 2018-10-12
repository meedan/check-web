import React from 'react';
import Relay from 'react-relay/classic';
import CreateTaskMenu from '../task/CreateTaskMenu';
import EditTaskDialog from '../task/EditTaskDialog';
import UpdateTeamMutation from '../../relay/mutations/UpdateTeamMutation';

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
    const {
      label,
      description,
      required,
      jsonoptions,
      projects,
    } = task;

    const newTeamTask = {
      label,
      description,
      required: required ? 1 : 0,
      type: this.state.createType,
      projects,
      options: JSON.parse(jsonoptions),
    };

    const checklist = [...this.props.team.checklist];
    checklist.push(newTeamTask);

    this.submitChecklist(checklist);
  };

  submitChecklist = (checklist) => {
    const team_tasks = JSON.stringify(checklist);

    const onSuccess = () => {
      this.handleClose();
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
    return (
      <div>
        <CreateTaskMenu onSelect={this.handleSelectType} hideTeamwideOption />
        { this.state.createType ?
          <EditTaskDialog
            taskType={this.state.createType}
            onDismiss={this.handleClose}
            onSubmit={this.handleSubmitTask}
            projects={this.props.team.projects.edges}
            noAssign
          />
          : null
        }
      </div>
    );
  }
}

export default CreateTeamTask;
