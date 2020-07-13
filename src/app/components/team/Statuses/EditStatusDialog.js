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
import { caption, opaqueBlack38, opaqueBlack87, units } from '../../../styles/js/shared';

const maxLength = 35;

const StyledColorPickerContainer = styled.div`
  margin: ${units(2)} 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const StyledSelectedColorDisplay = styled.div`
  width: ${units(5)};
  height: ${units(5)};
  border-radius: 50%;
  background-color: ${props => props.color};
`;

const StyledSelectedColor = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const StyledParamName = styled.span`
  font: ${caption};
  color: ${opaqueBlack38};
`;
const StyledHexValue = styled.span`
  font: ${caption};
  color: ${opaqueBlack87};
`;

const StyledSliderContainer = styled.div`
  width: 80%;
`;

const EditStatusDialog = ({
  defaultLanguage,
  onDismiss,
  onSubmit,
  open,
  status,
}) => {
  const [statusName, setStatusName] = React.useState(status ? status.label : '');
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
          <StyledSelectedColor>
            <StyledParamName>
              <FormattedMessage
                id="editStatusDialog.statusColor"
                defaultMessage="Status color"
              />
            </StyledParamName>
            <StyledHexValue>{statusColor}</StyledHexValue>
            <StyledSelectedColorDisplay color={statusColor} />
          </StyledSelectedColor>
          <StyledSliderContainer>
            <SliderPicker
              color={statusColor}
              onChangeComplete={color => setStatusColor(color.hex)}
            />
          </StyledSliderContainer>
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
