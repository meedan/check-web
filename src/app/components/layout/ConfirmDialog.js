import React from 'react';
import { FormattedMessage } from 'react-intl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { units } from '../../styles/js/shared';
import Message from '../Message';

class ConfirmDialog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      confirmed: false,
    };
  }

  handleConfirmation = () => {
    this.setState({ confirmed: !this.state.confirmed });
  };

  handleCancel = () => {
    this.setState({ confirmed: false });
    if (this.props.handleClose) {
      this.props.handleClose();
    }
  }

  render() {
    return (
      <Dialog
        open={this.props.open}
        onClose={this.props.handleClose}
      >
        <DialogContent>
          <h2 style={{ marginBottom: units(3) }}>{this.props.title}</h2>
          <Message message={this.props.message} />
          {this.props.blurb}
          <div style={{ margin: `${units(4)} 0` }}>
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
            onClick={this.props.handleConfirm}
            color="primary"
            disabled={!this.state.confirmed}
          >
            <FormattedMessage id="teamTasks.continue" defaultMessage="Continue" />
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default ConfirmDialog;
