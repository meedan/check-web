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

    return (
      <Dialog
        open={this.props.open}
        onClose={this.props.handleClose}
      >
        <DialogTitle>
          <FormattedMessage id="teamTasks.confirmDeleteMetadataTitle" defaultMessage="Are you sure you want to delete this field?" />
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" component="div" paragraph>
            <Message message={this.props.message} />
            <Box my={2} mx={0}>
              { task.tasks_with_answers_count > 0 ?
                <div>
                  <Box>
                    <FormattedMessage
                      id="teamTasks.confirmDeleteBlurbMetadata"
                      defaultMessage="{itemsNumber, plural, one {The field {fieldLabel} has been completed in # item.} other {The field {fieldLabel} has been completed in # items.}}"
                      description="Warning about existing completed instances of a field before performing deletion of it"
                      values={{
                        itemsNumber: task.tasks_with_answers_count,
                        fieldLabel: <strong>{this.props.task.label}</strong>,
                      }}
                    />
                  </Box>
                  <Box mt={2}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          id="keep-dialog__checkbox"
                          onChange={this.handlekeepCompleted.bind(this)}
                          checked={this.state.keepCompleted}
                        />
                      }
                      label={
                        <FormattedMessage
                          id="teamTasks.confirmDeletekeepCompletedMetadata"
                          defaultMessage="Keep this field with answers in items where it has been completed."
                          description="Label to checkbox for choosing whether completed fields should be deleted or not"
                        />
                      }
                    />
                  </Box>
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
            <FormattedMessage id="teamTasks.deleteMetadata" defaultMessage="Delete field" />
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default TeamTaskConfirmDialog;
