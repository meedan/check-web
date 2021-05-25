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
    const { projects } = this.props;
    let action = 'delete';
    if (this.props.action === 'edit') {
      action = this.props.editLabelOrDescription ? 'editLabelOrDescription' : 'edit';
    }
    const deleteConfirmDialogTitle = this.props.fieldset === 'tasks' ?
      <FormattedMessage id="teamTasks.confirmDeleteTaskTitle" defaultMessage="Are you sure you want to delete this task?" /> :
      <FormattedMessage id="teamTasks.confirmDeleteMetadataTitle" defaultMessage="Are you sure you want to delete this metadata?" />;
    const editConfirmDialogTitle = this.props.fieldset === 'tasks' ?
      <FormattedMessage id="teamTasks.confirmEditTaskTitle" defaultMessage="Are you sure you want to edit this task?" /> :
      <FormattedMessage id="teamTasks.confirmEditMetadataTitle" defaultMessage="Are you sure you want to edit this metadata?" />;
    const confirmDialogTitle = {
      edit: editConfirmDialogTitle,
      delete: deleteConfirmDialogTitle,
    };
    let affectedItems = 0;
    if (projects !== null) {
      let { selectedProjects } = this.props;
      if (action === 'editLabelOrDescription' && this.props.editedTask !== null) {
        selectedProjects = JSON.parse(this.props.editedTask.json_project_ids);
      }
      projects.forEach((project) => {
        if (selectedProjects.length === 0 || selectedProjects.indexOf(project.node.dbid) > -1) {
          affectedItems += project.node.medias_count;
        }
      });
    }

    const confirmDialogBlurbEditOrDelete = (
      <FormattedMessage
        id="teamTasks.confirmDeleteBlurb"
        defaultMessage="{itemsNumber, plural, one {The task {taskLabel} has been completed in # item.} other {The task {taskLabel} has been completed in # items.}}"
        values={{
          itemsNumber: affectedItems,
          taskLabel: <strong>{this.props.task.label}</strong>,
        }}
      />
    );
    const confirmDialogBlurb = {
      edit: <FormattedMessage
        id="teamTasks.confirmEditBlurb"
        defaultMessage="Related item tasks will be modified as a consequence of applying this change, except for those that have already been completed."
      />,
      editLabelOrDescription: confirmDialogBlurbEditOrDelete,
      delete: confirmDialogBlurbEditOrDelete,
    };

    const confirmkeepCompleted = {
      edit: <FormattedMessage
        id="teamTasks.confirmEditkeepCompleted"
        defaultMessage="Do not alter tasks that have been completed, and keep their existing answers."
      />,
      delete: <FormattedMessage
        id="teamTasks.confirmDeletekeepCompleted"
        defaultMessage="Keep this task with answers in items where the task has been completed."
      />,
    };
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
              { affectedItems > 0 ?
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
            { action === 'delete' ?
              <FormattedMessage id="teamTasks.deleteTask" defaultMessage="Delete task" /> :
              <FormattedMessage id="teamTasks.continue" defaultMessage="Edit task" />
            }
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default TeamTaskConfirmDialog;
