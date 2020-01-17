import React from 'react';
import { injectIntl } from 'react-intl';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import CreateMediaInput from './CreateMediaInput';
import globalStrings from '../../globalStrings';

class CreateMediaDialog extends React.Component {
  handleSubmit = () => {
    const submitButton = document.getElementById('create-media-submit');
    if (submitButton) {
      submitButton.click();
    }
  };

  render() {
    return (
      <Dialog open={this.props.open} fullWidth>
        <DialogTitle>{this.props.title}</DialogTitle>
        <DialogContent>
          <CreateMediaInput
            message={this.props.message}
            onSubmit={this.props.onSubmit}
            submitHidden
            noSource
          />
        </DialogContent>
        <DialogActions>
          <Button id="create-media-dialog__dismiss-button" onClick={this.props.onDismiss}>
            {this.props.intl.formatMessage(globalStrings.cancel)}
          </Button>
          <Button id="create-media-dialog__submit-button" onClick={this.handleSubmit} color="primary">
            {this.props.intl.formatMessage(globalStrings.submit)}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default injectIntl(CreateMediaDialog);
