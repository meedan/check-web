import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import { FormattedGlobalMessage } from '../../MappedMessage';
import ColorPicker from '../../layout/ColorPicker';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';
import dialogStyles from '../../../styles/css/dialog.module.css';

const maxLength = 35;

const EditStatusDialog = ({
  defaultLanguage,
  onCancel,
  onSubmit,
  open,
  team,
  defaultValue: status,
}) => {
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
      className={dialogStyles['dialog-window']}
      open={open}
      maxWidth="xs"
      fullWidth
    >
      <div className={dialogStyles['dialog-title']}>
        { status ? (
          <FormattedMessage
            tagName="h6"
            id="editStatusDialog.titleEdit"
            defaultMessage="Edit status"
            description="Dialog title for editing a status message"
          />
        ) : (
          <FormattedMessage
            tagName="h6"
            id="editStatusDialog.title"
            defaultMessage="Add a new status"
            description="Dialog title for adding a new status message"
          />
        )}
      </div>
      <div className={dialogStyles['dialog-content']}>
        <Box display="flex">
          <TextField
            id="edit-status-dialog__status-name"
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
            <FormattedMessage
              tagName="p"
              id="editStatusDialog.messageDescription"
              defaultMessage="Send a message to the user who requested the item when you change an item to this status."
              description="Accompanying description for editStatusDialog.toggleStatusMessage"
            />
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
              rows="5"
              rowsMax={Infinity}
            />
          </React.Fragment> : null }
      </div>
      <div className={dialogStyles['dialog-actions']}>
        <ButtonMain
          className="edit-status-dialog__dismiss"
          onClick={onCancel}
          size="default"
          variant="text"
          theme="lightText"
          label={
            <FormattedGlobalMessage messageKey="cancel" />
          }
        />
        <ButtonMain
          className="edit-status-dialog__submit"
          disabled={!statusLabel}
          size="default"
          variant="contained"
          theme="brand"
          onClick={team.smooch_bot ? handleConfirmSubmit : handleSubmit}
          label={status ? (
            <FormattedGlobalMessage messageKey="save" />
          ) : (
            <FormattedMessage
              id="editStatusDialog.addButton"
              defaultMessage="Add status"
              description="Button label to add a new status"
            />
          )}
        />
      </div>
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
