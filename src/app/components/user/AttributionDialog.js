/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import globalStrings from '../../globalStrings';
import Message from '../Message';
import Attribution from '../task/Attribution';

class AttributionDialog extends React.Component {
  handleSubmit = () => {
    const { value } = document.getElementById('attribution-attribution-dialog');
    this.props.onSubmit(value);
  };

  render() {
    return (
      <Dialog
        className="attribution-dialog"
        open={this.props.open}
        onClose={this.props.onDismiss}
        scroll="paper"
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          { this.props.title }
        </DialogTitle>
        <DialogContent>
          <Message message={this.props.message} />
          <Box my={2}>
            { this.props.blurb }
          </Box>
          <Attribution
            id="attribution-dialog"
            taskType={this.props.taskType}
            multi
            selectedUsers={this.props.selectedUsers}
          />
        </DialogContent>
        <DialogActions>
          <Button
            className="attribution-dialog__cancel"
            onClick={this.props.onDismiss}
          >
            <FormattedMessage {...globalStrings.cancel} />
          </Button>
          <Button
            color="primary"
            className="attribution-dialog__save"
            onClick={this.handleSubmit}
          >
            <FormattedMessage {...globalStrings.submit} />
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

AttributionDialog.propTypes = {
  taskType: PropTypes.string.isRequired,
};

export default AttributionDialog;
