import React from 'react';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import CreateTaskMenu from '../task/CreateTaskMenu';
import EditTaskDialog from '../task/EditTaskDialog';
import CreateTeamTaskMutation from '../../relay/mutations/CreateTeamTaskMutation';
import { getErrorMessage } from '../../helpers';
import { stringHelper } from '../../customHelpers';

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
      show_in_browser_extension: task.show_in_browser_extension,
      task_type: this.state.createType,
      json_options: task.jsonoptions,
      json_project_ids: task.json_project_ids,
      json_schema: task.jsonschema,
      fieldset: this.props.fieldset,
      associated_type: this.props.associatedType,
    };

    const onSuccess = () => {
      this.setState({ message: null });
      this.handleClose();
    };

    const onFailure = (transaction) => {
      const fallbackMessage = this.props.fieldset === 'tasks' ? (
        <FormattedMessage
          id="createTeamTask.errorTask"
          defaultMessage="Sorry, an error occurred while creating the task. Please try again and contact {supportEmail} if the condition persists."
          values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
        />
      ) : (
        <FormattedMessage
          id="createTeamTask.errorMetadata"
          defaultMessage="Sorry, an error occurred while updating the metadata field. Please try again and contact {supportEmail} if the condition persists."
          values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
        />
      );

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
    const { projects } = this.props.team;

    return (
      <div>
        <CreateTaskMenu
          fieldset={this.props.fieldset}
          onSelect={this.handleSelectType}
          teamSettings
        />
        { this.state.createType ?
          <EditTaskDialog
            fieldset={this.props.fieldset}
            message={this.state.message}
            onDismiss={this.handleClose}
            onSubmit={this.handleSubmitTask}
            projects={projects ? projects.edges : null}
            isTeamTask
          />
          : null
        }
      </div>
    );
  }
}

export default CreateTeamTask;
