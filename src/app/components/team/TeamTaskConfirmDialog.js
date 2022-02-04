import React from 'react';
import { FormattedMessage } from 'react-intl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';
import Message from '../Message';

class TeamTaskConfirmDialog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      keepCompleted: false,
    };
  }

  handlekeepCompleted= () => {
    this.setState({ keepCompleted: !this.state.keepCompleted });
  };

  handleCancel = () => {
    this.setState({ keepCompleted: false });
    if (this.props.handleClose) {
      this.props.handleClose();
    }
  }

  handleProceed = () => {
    if (this.props.handleConfirm) {
      this.props.handleConfirm(this.state.keepCompleted);
      this.setState({ keepCompleted: false });
    }
  }

  render() {
    const { task } = this.props;
    let action = 'delete';
    if (this.props.action === 'edit') {
      action = this.props.labelOrDescriptionChanged ? 'labelOrDescriptionChanged' : 'edit';
    }
    const deleteConfirmDialogTitle = this.props.fieldset === 'tasks' ?
      <FormattedMessage id="teamTasks.confirmDeleteTaskTitle" defaultMessage="Are you sure you want to delete this task?" /> :
      <FormattedMessage id="teamTasks.confirmDeleteMetadataTitle" defaultMessage="Are you sure you want to delete this field?" />;
    const editConfirmDialogTitle = this.props.fieldset === 'tasks' ?
      <FormattedMessage id="teamTasks.confirmEditTaskTitle" defaultMessage="Are you sure you want to edit this task?" /> :
      <FormattedMessage id="teamTasks.confirmEditMetadataTitle" defaultMessage="Are you sure you want to edit this field?" />;
    const confirmDialogTitle = {
      edit: editConfirmDialogTitle,
      delete: deleteConfirmDialogTitle,
    };

    const confirmDialogBlurbEditOrDelete = this.props.fieldset === 'tasks' ? (
      <FormattedMessage
        id="teamTasks.confirmDeleteBlurb"
        defaultMessage="{itemsNumber, plural, one {The task {taskLabel} has been completed in # item.} other {The task {taskLabel} has been completed in # items.}}"
        description="Warning about existing completed instances of a task before performing deletion of it"
        values={{
          itemsNumber: task.tasks_with_answers_count,
          taskLabel: <strong>{this.props.task.label}</strong>,
        }}
      />
    ) : (
      <FormattedMessage
        id="teamTasks.confirmDeleteBlurbMetadata"
        defaultMessage="{itemsNumber, plural, one {The field {fieldLabel} has been completed in # item.} other {The field {fieldLabel} has been completed in # items.}}"
        description="Warning about existing completed instances of a field before performing deletion of it"
        values={{
          itemsNumber: task.tasks_with_answers_count,
          fieldLabel: <strong>{this.props.task.label}</strong>,
        }}
      />
    );
    const confirmDialogBlurb = {
      edit: this.props.fieldset === 'tasks' ? (
        <FormattedMessage
          id="teamTasks.confirmEditBlurb"
          defaultMessage="Related item tasks will be modified as a consequence of applying this change, except for those that have already been completed."
          description="Warning about existing instances of a task before performing changes to it"
        />
      ) : (
        <FormattedMessage
          id="teamTasks.confirmEditBlurbMetadata"
          defaultMessage="Related item fields will be modified as a consequence of applying this change, except for those that have already been completed."
          description="Warning about existing instances of a field before performing changes to it"
        />
      ),
      labelOrDescriptionChanged: confirmDialogBlurbEditOrDelete,
      delete: confirmDialogBlurbEditOrDelete,
    };

    const confirmkeepCompleted = {
      edit: this.props.fieldset === 'tasks' ? (
        <FormattedMessage
          id="teamTasks.confirmEditkeepCompleted"
          defaultMessage="Do not alter tasks that have been completed, and keep their existing answers."
          description="Label to checkbox for choosing whether completed tasks should be changed or not"
        />
      ) : (
        <FormattedMessage
          id="teamTasks.confirmEditkeepCompletedMetadata"
          defaultMessage="Do not alter fields that have been completed, and keep their existing answers."
          description="Label to checkbox for choosing whether completed fields should be changed or not"
        />
      ),
      delete: this.props.fieldset === 'tasks' ? (
        <FormattedMessage
          id="teamTasks.confirmDeletekeepCompleted"
          defaultMessage="Keep this task with answers in items where the task has been completed."
          description="Label to checkbox for choosing whether completed tasks should be deleted or not"
        />
      ) : (
        <FormattedMessage
          id="teamTasks.confirmDeletekeepCompletedMetadata"
          defaultMessage="Keep this field with answers in items where it has been completed."
          description="Label to checkbox for choosing whether completed fields should be deleted or not"
        />
      ),
    };

    const deleteAction = this.props.fieldset === 'tasks' ? (
      <FormattedMessage id="teamTasks.deleteTask" defaultMessage="Delete task" />
    ) : (
      <FormattedMessage id="teamTasks.deleteMetadata" defaultMessage="Delete field" />
    );

    const editAction = this.props.fieldset === 'tasks' ? (
      <FormattedMessage id="teamTasks.continue" defaultMessage="Edit task" />
    ) : (
      <FormattedMessage id="teamTasks.continueMetadata" defaultMessage="Edit field" />
    );

    return (
      <Dialog
        open={this.props.open}
        onClose={this.props.handleClose}
      >
        <DialogTitle>
          {confirmDialogTitle[this.props.action]}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" component="div" paragraph>
            <Message message={this.props.message} />
            <Box my={2} mx={0}>
              { task.tasks_with_answers_count > 0 ?
                <div>
                  <Box>
                    {confirmDialogBlurb[action]}
                  </Box>
                  { action !== 'edit' ?
                    <Box mt={2}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            id="keep-dialog__checkbox"
                            onChange={this.handlekeepCompleted.bind(this)}
                            checked={this.state.keepCompleted}
                          />
                        }
                        label={confirmkeepCompleted[this.props.action]}
                      />
                    </Box>
                    : null
                  }
                </div> : null
              }
            </Box>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            id="confirm-dialog__cancel-action-button"
            onClick={this.handleCancel}
          >
            <FormattedMessage id="teamTasks.cancelAction" defaultMessage="Cancel" />
          </Button>
          <Button
            id="confirm-dialog__confirm-action-button"
            onClick={this.handleProceed}
            color="primary"
            disabled={this.props.disabled}
            variant="contained"
          >
            { action === 'delete' ? deleteAction : editAction }
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default TeamTaskConfirmDialog;
