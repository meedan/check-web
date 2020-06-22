import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import globalStrings from '../../../globalStrings';

const EditStatusDialog = ({ open }) => (
  <Dialog
    open={open}
    maxWidth="xs"
    fullWidth
  >
    <DialogTitle>
      <FormattedMessage
        id="editStatusDialog.title"
        defaultMessage="Add a new status"
      />
    </DialogTitle>
    <DialogContent>
      <TextField
        id="edit-status-dialog__status-name"
        label={(
          <FormattedMessage
            id="editStatusDialog.statusTitle"
            defaultMessage="Status (35 characters max)"
          />
        )}
        variant="outlined"
      />
      <TextField
        id="edit-status-dialog__status-description"
        label={(
          <FormattedMessage
            id="editStatusDialog.statusDescription"
            defaultMessage="Description"
          />
        )}
        variant="outlined"
      />
    </DialogContent>
    <DialogActions>
      <Button>
        <FormattedMessage {...globalStrings.cancel} />
      </Button>
      <Button color="primary" variant="contained">
        <FormattedMessage
          id="editStatusDialog.addButton"
          defaultMessage="Add status"
        />
      </Button>
    </DialogActions>
  </Dialog>
);

export default EditStatusDialog;
