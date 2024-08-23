import React from 'react';
import { FormattedMessage } from 'react-intl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Dialog from '@material-ui/core/Dialog';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import dialogStyles from '../../styles/css/dialog.module.css';

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
      action = this.props.editLabelOrDescription ? 'editLabelOrDescription' : 'edit';
    }
    const deleteConfirmDialogTitle = <FormattedMessage defaultMessage="Are you sure you want to delete this field?" description="Delete confirmation message" id="teamTasks.confirmDeleteMetadataTitle" tagName="h6" />;
    const editConfirmDialogTitle = <FormattedMessage defaultMessage="Are you sure you want to edit this field?" description="Editing confirmation message" id="teamTasks.confirmEditMetadataTitle" tagName="h6" />;
    const confirmDialogTitle = {
      edit: editConfirmDialogTitle,
      delete: deleteConfirmDialogTitle,
    };

    const confirmDialogBlurbEditOrDelete = (
      <FormattedMessage
        defaultMessage="{itemsNumber, plural, one {The field {fieldLabel} has been completed in # item.} other {The field {fieldLabel} has been completed in # items.}}"
        description="Warning about existing completed instances of a field before performing deletion of it"
        id="teamTasks.confirmDeleteBlurbMetadata"
        tagName="p"
        values={{
          itemsNumber: task.tasks_with_answers_count,
          fieldLabel: <strong>{this.props.task.label}</strong>,
        }}
      />
    );
    const confirmDialogBlurb = {
      edit: (
        <FormattedMessage
          defaultMessage="Related item fields will be modified as a consequence of applying this change, except for those that have already been completed."
          description="Warning about existing instances of a field before performing changes to it"
          id="teamTasks.confirmEditBlurbMetadata"
          tagName="p"
        />
      ),
      editLabelOrDescription: confirmDialogBlurbEditOrDelete,
      delete: confirmDialogBlurbEditOrDelete,
    };

    const confirmkeepCompleted = {
      edit: (
        <FormattedMessage
          defaultMessage="Do not alter fields that have been completed, and keep their existing answers."
          description="Label to checkbox for choosing whether completed fields should be changed or not"
          id="teamTasks.confirmEditkeepCompletedMetadata"
        />
      ),
      delete: (
        <FormattedMessage
          defaultMessage="Keep this field with answers in items where it has been completed."
          description="Label to checkbox for choosing whether completed fields should be deleted or not"
          id="teamTasks.confirmDeletekeepCompletedMetadata"
        />
      ),
    };

    const deleteAction = (
      <FormattedMessage defaultMessage="Delete field" description="Button label to delete a field" id="teamTasks.deleteMetadata" />
    );

    const editAction = (
      <FormattedMessage defaultMessage="Edit field" description="Button label to edit a field" id="teamTasks.continueMetadata" />
    );

    return (
      <Dialog
        className={dialogStyles['dialog-window']}
        open={this.props.open}
        onClose={this.props.handleClose}
      >
        <div className={dialogStyles['dialog-title']}>
          {confirmDialogTitle[this.props.action]}
        </div>
        <div className={dialogStyles['dialog-content']}>
          { task.tasks_with_answers_count > 0 ?
            <>
              {confirmDialogBlurb[action]}
              { action !== 'edit' ?
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={this.state.keepCompleted}
                      id="keep-dialog__checkbox"
                      onChange={this.handlekeepCompleted.bind(this)}
                    />
                  }
                  label={confirmkeepCompleted[this.props.action]}
                />
                : null
              }
            </> : null
          }
        </div>
        <div className={dialogStyles['dialog-actions']}>
          <ButtonMain
            buttonProps={{
              id: 'confirm-dialog__cancel-action-button',
            }}
            label={
              <FormattedMessage defaultMessage="Cancel" description="Dialog box cancel button label" id="teamTasks.cancelAction" />
            }
            size="default"
            theme="lightText"
            variant="text"
            onClick={this.handleCancel}
          />
          <ButtonMain
            buttonProps={{
              id: 'confirm-dialog__confirm-action-button',
            }}
            disabled={this.props.disabled}
            label={action === 'delete' ? deleteAction : editAction}
            size="default"
            theme="info"
            variant="contained"
            onClick={this.handleProceed}
          />
        </div>
      </Dialog>
    );
  }
}

export default TeamTaskConfirmDialog;
