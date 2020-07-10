import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import { SliderPicker } from 'react-color';
import styled from 'styled-components';
import globalStrings from '../../../globalStrings';
import { units } from '../../../styles/js/shared';

const maxLength = 35;

const StyledColorPickerContainer = styled.div`
  margin: ${units(2)};
`;

const EditStatusDialog = ({
  defaultLanguage,
  onDismiss,
  onSubmit,
  open,
  status,
}) => {
  const [statusName, setStatusName] = React.useState(status ? status.label : '');
  const [statusDescription, setStatusDescription] = React.useState(status ? status.locales[defaultLanguage].label : '');
  const [statusColor, setStatusColor] = React.useState(status ? status.style.color : '');

  const handleSubmit = () => {
    const newStatus = {
      id: statusName + Date.now(),
      locales: {},
      style: { color: statusColor },
    };

    if (status) newStatus.id = status.id;

    newStatus.locales[defaultLanguage] = {
      label: statusName,
      description: statusDescription,
    };

    if (onSubmit) {
      onSubmit(newStatus);
    }
  };

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
        <StyledColorPickerContainer>
          <SliderPicker
            color={statusColor}
            onChangeComplete={color => setStatusColor(color.hex)}
          />
        </StyledColorPickerContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onDismiss}>
          <FormattedMessage {...globalStrings.cancel} />
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
        >
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
