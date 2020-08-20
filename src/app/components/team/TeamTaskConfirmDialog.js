import React from 'react';
import { FormattedMessage } from 'react-intl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Message from '../Message';
import {
  units,
  Row,
} from '../../styles/js/shared';

class TeamTaskConfirmDialog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      confirmed: false,
      keepCompleted: false,
    };
  }

  handleConfirmation = () => {
    this.setState({ confirmed: !this.state.confirmed });
  };

  handlekeepCompleted= () => {
    this.setState({ keepCompleted: !this.state.keepCompleted });
  };

  handleCancel = () => {
    this.setState({ confirmed: false, keepCompleted: false });
    if (this.props.handleClose) {
      this.props.handleClose();
    }
  }

  handleProceed = () => {
    this.setState({ confirmed: false });
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
    const confirmDialogTitle = {
      edit: <FormattedMessage
        id="teamTasks.confirmEditTitle"
        defaultMessage="Are you sure you want to edit this task?"
      />,
      delete: <FormattedMessage
        id="teamTasks.confirmDeleteTitle"
        defaultMessage="Are you sure you want to delete this task?"
      />,
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

    const confirmDialogBlurb = {
      edit: <FormattedMessage
        id="teamTasks.confirmEditBlurb"
        defaultMessage="Related item tasks will be modified as a consequence of applying this change, except for those that have already been completed."
      />,
      editLabelOrDescription: <FormattedMessage
        id="teamTasks.confirmEditLabelOrDescriptionBlurb"
        defaultMessage="You are about to edit tasks in {itemsNumber, plural, one {1 item} other {# items}}. If you proceed, all those tasks will also be modified."
        values={{ itemsNumber: affectedItems }}
      />,
      delete: <FormattedMessage
        id="teamTasks.confirmDeleteBlurb"
        defaultMessage="You are about to delete the selected tasks from {itemsNumber, plural, one {1 item} other {# items}}. If you proceed, the answers to these tasks will also be deleted."
        values={{ itemsNumber: affectedItems }}
      />,
    };

    const confirmkeepCompleted = {
      edit: <FormattedMessage
        id="teamTasks.confirmEditkeepCompleted"
        defaultMessage="Keep the completed tasks, with their current name and description."
      />,
      delete: <FormattedMessage
        id="teamTasks.confirmDeletekeepCompleted"
        defaultMessage="Keep the completed tasks, with their current answers."
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
          <Message message={this.props.message} />
          <div style={{ margin: `${units(2)} 0` }}>
            { affectedItems > 0 ?
              <div>
                <Row>
                  {confirmDialogBlurb[action]}
                </Row>
                { action !== 'edit' ?
                  <Row>
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
                  </Row>
                  : null
                }
                <Row>
                  <FormattedMessage
                    id="teamTasks.processMessage"
                    defaultMessage="Do you want to proceed?"
                  />
                </Row>
              </div> : null
            }
            <Row>
              <FormControlLabel
                control={
                  <Checkbox
                    id="confirm-dialog__checkbox"
                    onChange={this.handleConfirmation.bind(this)}
                    checked={this.state.confirmed}
                  />
                }
                label={<FormattedMessage id="teamTasks.confirmAction" defaultMessage="Yes" />}
              />
            </Row>
          </div>
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
            disabled={this.props.disabled || !this.state.confirmed}
          >
            <FormattedMessage id="teamTasks.continue" defaultMessage="Continue" />
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default TeamTaskConfirmDialog;
