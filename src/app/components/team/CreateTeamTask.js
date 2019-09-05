import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Relay from 'react-relay/classic';
import CreateTaskMenu from '../task/CreateTaskMenu';
import EditTaskDialog from '../task/EditTaskDialog';
import CreateTeamTaskMutation from '../../relay/mutations/CreateTeamTaskMutation';
import { getErrorMessage } from '../../helpers';

const messages = defineMessages({
  error: {
    id: 'createTeamTask.error',
    defaultMessage: 'Failed to create teamwide task',
  },
});

class CreateTeamTask extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      createType: null,
      message: null,
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
      this.setState({ message: null });
      this.handleClose();
    };

    const onFailure = (transaction) => {
      const fallbackMessage = this.props.intl.formatMessage(messages.error);
      const message = getErrorMessage(transaction, fallbackMessage);
      this.setState({ message });
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
            message={this.state.message}
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

export default injectIntl(CreateTeamTask);
