import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import { FormattedGlobalMessage } from '../../MappedMessage';
import ColorPicker from '../../layout/ColorPicker';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';

const maxLength = 35;

const useStyles = makeStyles(theme => ({
  textField: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  editStatusDialogActions: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
}));

const EditStatusDialog = ({
  defaultLanguage,
  onCancel,
  onSubmit,
  open,
  team,
  defaultValue: status,
}) => {
  const classes = useStyles();
  const [statusLabel, setStatusLabel] = React.useState(status ? status.label : '');
  const [statusDescription, setStatusDescription] = React.useState(status ? status.locales[defaultLanguage].description : '');
  const [statusColor, setStatusColor] = React.useState(status ? status.style.color : 'var(--textPrimary)');
  const [statusMessage, setStatusMessage] = React.useState(status ? status.locales[defaultLanguage].message : '');
  const [statusMessageEnabled, setStatusMessageEnabled] = React.useState(status ? Boolean(status.should_send_message) : false);
  const [showSaveConfirmDialog, setShowSaveConfirmDialog] = React.useState(false);

  const handleSubmit = () => {
    const locales = status && status.locales ? { ...status.locales } : {};
    const newStatus = {
      id: Date.now().toString(),
      locales,
      style: { color: statusColor },
      should_send_message: statusMessageEnabled,
    };

    if (status) newStatus.id = status.id;

    newStatus.locales[defaultLanguage] = {
      label: statusLabel,
      description: statusDescription,
      message: statusMessage,
    };

    onSubmit(newStatus);
  };

  const handleConfirmSubmit = () => {
    if (status && status.label !== statusLabel) {
      setShowSaveConfirmDialog(true);
    } else {
      handleSubmit();
    }
  };

  const handleChangeColor = (event) => {
    setStatusColor(event.target.value);
  };

  return (
    <Dialog
      open={open}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>
        { status ? (
          <FormattedMessage
            id="editStatusDialog.titleEdit"
            defaultMessage="Edit status"
            description="Dialog title for editing a status message"
          />
        ) : (
          <FormattedMessage
            id="editStatusDialog.title"
            defaultMessage="Add a new status"
            description="Dialog title for adding a new status message"
          />
        )}
      </DialogTitle>
      <DialogContent>
        <Box display="flex">
          <TextField
            id="edit-status-dialog__status-name"
            className={classes.textField}
            inputProps={{
              maxLength,
            }}
            label={(
              <FormattedMessage
                id="editStatusDialog.statusTitle"
                defaultMessage="Status ({maxLength} characters max)"
                description="Text field label for the status name"
                values={{ maxLength }}
              />
            )}
            value={statusLabel}
            onChange={e => setStatusLabel(e.target.value)}
            variant="outlined"
            fullWidth
          />
          <Box p={1} />
          <ColorPicker
            color={statusColor}
            onChange={handleChangeColor}
          />
        </Box>
        <TextField
          id="edit-status-dialog__status-description"
          label={(
            <FormattedMessage
              id="editStatusDialog.statusDescription"
              defaultMessage="Description"
              description="Text field label for the status description value"
            />
          )}
          value={statusDescription}
          onChange={e => setStatusDescription(e.target.value)}
          variant="outlined"
          margin="normal"
          fullWidth
          multiline
          rows={3}
        />
        { team.smooch_bot ?
          <React.Fragment>
            <FormControlLabel
              control={
                <Checkbox
                  className="edit-status-dialog__status-message-enabled"
                  checked={statusMessageEnabled}
                  onChange={(e, checked) => {
                    setStatusMessageEnabled(checked);
                  }}
                />
              }
              label={
                <FormattedMessage
                  id="editStatusDialog.toggleStatusMessage"
                  defaultMessage="Send message to requester"
                  description="Checkbox option to send a message to the user who requested the item"
                />
              }
            />
            <Typography variant="body1">
              <FormattedMessage
                id="editStatusDialog.messageDescription"
                defaultMessage="Send a message to the user who requested the item when you change an item to this status."
                description="Accompanying description for editStatusDialog.toggleStatusMessage"
              />
            </Typography>
            <TextField
              id="edit-status-dialog__status-message"
              label={(
                <FormattedMessage
                  id="editStatusDialog.statusMessage"
                  defaultMessage="Message"
                  description="Text field label for the message that will be sent to the user when an item is changed to this status value"
                />
              )}
              disabled={!statusMessageEnabled}
              value={statusMessage}
              onChange={e => setStatusMessage(e.target.value)}
              variant="outlined"
              margin="normal"
              fullWidth
              multiline
              rows={5}
              rowsMax={Infinity}
            />
          </React.Fragment> : null }
      </DialogContent>
      <DialogActions className={classes.editStatusDialogActions}>
        <Button className="edit-status-dialog__dismiss" onClick={onCancel}>
          <FormattedGlobalMessage messageKey="cancel" />
        </Button>
        <Button
          className="edit-status-dialog__submit"
          disabled={!statusLabel}
          onClick={team.smooch_bot ? handleConfirmSubmit : handleSubmit}
          color="primary"
          variant="contained"
        >
          { status ? (
            <FormattedGlobalMessage messageKey="save" />
          ) : (
            <FormattedMessage
              id="editStatusDialog.addButton"
              defaultMessage="Add status"
              description="Button label to add a new status"
            />
          )}
        </Button>
      </DialogActions>
      <ConfirmProceedDialog
        open={showSaveConfirmDialog}
        title={
          <FormattedMessage
            id="editStatusDialog.saveStatusTitle"
            defaultMessage="Save status"
            description="Confirmation dialog title. 'Save' here is in infinitive form."
          />
        }
        body={
          <FormattedMessage
            id="editStatusDialog.saveStatusMessage"
            defaultMessage="Any published report with this status will be updated with the new label and paused."
            description="Confirmation dialog description"
          />
        }
        onProceed={handleSubmit}
      />
    </Dialog>
  );
};

EditStatusDialog.propTypes = {
  defaultLanguage: PropTypes.string.isRequired,
  defaultValue: PropTypes.object,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  team: PropTypes.shape({
    smooch_bot: PropTypes.shape({
      id: PropTypes.string,
    }),
  }).isRequired,
};

EditStatusDialog.defaultProps = {
  defaultValue: null,
};

export default EditStatusDialog;
