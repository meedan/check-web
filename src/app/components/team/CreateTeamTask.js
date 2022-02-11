/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import Button from '@material-ui/core/Button';
import EditTaskDialog from '../task/EditTaskDialog';
import CreateTeamTaskMutation from '../../relay/mutations/CreateTeamTaskMutation';
import { getErrorMessage } from '../../helpers';
import { stringHelper } from '../../customHelpers';

class CreateTeamTask extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      dialogOpen: false,
      message: null,
    };
  }

  handleOpen = () => this.setState({ dialogOpen: true });
  handleClose = () => this.setState({ dialogOpen: false });

  handleSubmitTask = (task) => {
    const teamTask = {
      label: task.label,
      description: task.description,
      show_in_browser_extension: task.show_in_browser_extension,
      task_type: task.type,
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
      <React.Fragment>
        <Button
          className="create-task__add-button"
          onClick={this.handleOpen}
          variant="contained"
          color="primary"
        >
          { this.props.fieldset === 'metadata' ?
            <FormattedMessage
              id="createTeamTask.addField"
              defaultMessage="New annotation field"
              description="Button that triggers creation of a new field"
            /> :
            <FormattedMessage
              id="createTeamTask.addTask"
              defaultMessage="New task"
              description="Button that triggers creation of a new task"
            />
          }
        </Button>
        { this.state.dialogOpen ?
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
      </React.Fragment>
    );
  }
}

CreateTeamTask.propTypes = {
  fieldset: PropTypes.string.isRequired,
  team: PropTypes.object.isRequired,
  associatedType: PropTypes.string,
};

CreateTeamTask.defaultProps = {
  associatedType: null,
};

export default CreateTeamTask;
