/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
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
      json_schema: task.jsonschema,
      fieldset: this.props.fieldset,
      associated_type: this.props.associatedType,
    };

    const onSuccess = () => {
      this.setState({ message: null });
      this.handleClose();
    };

    const onFailure = (transaction) => {
      const fallbackMessage = (
        <FormattedMessage
          defaultMessage="Sorry, an error occurred while updating the metadata field. Please try again and contact {supportEmail} if the condition persists."
          description="Error message displayed when creating an annotation field fails"
          id="createTeamTask.errorMetadata"
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
    return (
      <React.Fragment>
        <ButtonMain
          className="create-task__add-button"
          label={
            <FormattedMessage
              defaultMessage="New annotation field"
              description="Button that triggers creation of a new field"
              id="createTeamTask.addField"
            />
          }
          size="default"
          theme="info"
          variant="contained"
          onClick={this.handleOpen}
        />
        { this.state.dialogOpen ?
          <EditTaskDialog
            message={this.state.message}
            onDismiss={this.handleClose}
            onSubmit={this.handleSubmitTask}
          />
          : null
        }
      </React.Fragment>
    );
  }
}

CreateTeamTask.propTypes = {
  team: PropTypes.object.isRequired,
  associatedType: PropTypes.string.isRequired,
};

// TODO createFragmentContainer
export default CreateTeamTask;
