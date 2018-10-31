import React from 'react';
import { FormattedMessage } from 'react-intl';
import Checkbox from 'material-ui/Checkbox';
import FlatButton from 'material-ui/FlatButton';
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
            <Checkbox
              id="confirm-dialog__checkbox"
              onCheck={this.handleConfirmation.bind(this)}
              checked={this.state.confirmed}
              label={<FormattedMessage id="teamTasks.confirmAction" defaultMessage="Yes" />}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <FlatButton
            id="team-tasks__cancel-action-button"
            label={<FormattedMessage id="teamTasks.cancelAction" defaultMessage="Cancel" />}
            onClick={this.props.handleClose}
          />
          <FlatButton
            id="team-tasks__confirm-action-button"
            label={<FormattedMessage id="teamTasks.continue" defaultMessage="Continue" />}
            primary
            keyboardFocused
            onClick={this.props.handleConfirm}
            disabled={!this.state.confirmed}
          />
        </DialogActions>
      </Dialog>
    );
  }
}

export default ConfirmDialog;
