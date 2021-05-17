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
import { isBotInstalled } from '../../../helpers';

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
  const [statusColor, setStatusColor] = React.useState(status ? status.style.color : '#000000');
  const [statusMessage, setStatusMessage] = React.useState(status ? status.locales[defaultLanguage].message : '');
  const [statusMessageEnabled, setStatusMessageEnabled] = React.useState(status ? Boolean(status.should_send_message) : false);

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
          />
        ) : (
          <FormattedMessage
            id="editStatusDialog.title"
            defaultMessage="Add a new status"
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
            onChange={color => setStatusColor(color.hex)}
          />
        </Box>
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
          multiline
          rows={3}
        />
        { isBotInstalled(team, 'smooch') ?
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
          onClick={handleSubmit}
          color="primary"
          variant="contained"
        >
          { status ? (
            <FormattedGlobalMessage messageKey="save" />
          ) : (
            <FormattedMessage
              id="editStatusDialog.addButton"
              defaultMessage="Add status"
            />
          )}
        </Button>
      </DialogActions>
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
    team_bot_installations: PropTypes.shape({
      edges: PropTypes.arrayOf(PropTypes.shape({
        node: PropTypes.shape({
          team_bot: PropTypes.shape({
            identifier: PropTypes.string,
          }),
        }),
      })).isRequired,
    }).isRequired,
  }).isRequired,
};

EditStatusDialog.defaultProps = {
  defaultValue: null,
};

export default EditStatusDialog;
