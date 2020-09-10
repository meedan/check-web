import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import { FormattedGlobalMessage } from '../../MappedMessage';
import ColorPicker from '../../layout/ColorPicker';

const maxLength = 35;

const useStyles = makeStyles(theme => ({
  textField: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

const EditStatusDialog = ({
  defaultLanguage,
  onCancel,
  onSubmit,
  open,
  defaultValue: status,
}) => {
  const classes = useStyles();
  const [statusLabel, setStatusLabel] = React.useState(status ? status.label : '');
  const [statusDescription, setStatusDescription] = React.useState(status ? status.locales[defaultLanguage].description : '');
  const [statusColor, setStatusColor] = React.useState(status ? status.style.color : '#000000');

  const handleSubmit = () => {
    const newStatus = {
      id: Date.now().toString(),
      locales: {},
      style: { color: statusColor },
    };

    if (status) newStatus.id = status.id;

    newStatus.locales[defaultLanguage] = {
      label: statusLabel,
      description: statusDescription,
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
      </DialogContent>
      <DialogActions>
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
};

EditStatusDialog.defaultProps = {
  defaultValue: null,
};

export default EditStatusDialog;
