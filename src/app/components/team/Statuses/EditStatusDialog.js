import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import globalStrings from '../../../globalStrings';

const EditStatusDialog = ({ open, onDismiss, onSubmit }) => {
  const [statusName, setStatusName] = React.useState('');
  const [statusDescription, setStatusDescription] = React.useState('');

  return (
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
          value={statusName}
          onChange={e => setStatusName(e.target.value)}
          variant="outlined"
          margin="normal"
          fullWidth
        />
        <TextField
          id="edit-status-dialog__status-description"
          label={(
            <FormattedMessage
              id="editStatusDialog.statusDescription"
              defaultMessage="Description"
            />
          )}
          value={statusDescription}
          onChange={e => setStatusDescription(e.target.value)}
          variant="outlined"
          margin="normal"
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onDismiss}>
          <FormattedMessage {...globalStrings.cancel} />
        </Button>
        <Button onClick={() => onSubmit({ statusName, statusDescription })} color="primary" variant="contained">
          <FormattedMessage
            id="editStatusDialog.addButton"
            defaultMessage="Add status"
          />
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditStatusDialog;
