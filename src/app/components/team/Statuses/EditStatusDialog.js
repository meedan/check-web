import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import cx from 'classnames/bind';
import LimitedTextArea from '../../layout/inputs/LimitedTextArea';
import SwitchComponent from '../../cds/inputs/SwitchComponent';
import TextArea from '../../cds/inputs/TextArea';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import { FormattedGlobalMessage } from '../../MappedMessage';
import ColorPicker from '../../cds/inputs/ColorPicker';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';
import dialogStyles from '../../../styles/css/dialog.module.css';
import styles from './Statuses.module.css';
import inputStyles from '../../../styles/css/inputs.module.css';

const EditStatusDialog = ({
  defaultLanguage,
  onCancel,
  onSubmit,
  open,
  team,
  defaultValue: status,
}) => {
  const [statusLabel, setStatusLabel] = React.useState(status ? status.locales[defaultLanguage].label : '');
  const [statusDescription, setStatusDescription] = React.useState(status ? status.locales[defaultLanguage].description : '');
  const [statusColor, setStatusColor] = React.useState(status ? status.style.color : '#567bff');
  const [statusMessage, setStatusMessage] = React.useState(status ? status.locales[defaultLanguage].message : '');
  const [statusMessageEnabled, setStatusMessageEnabled] = React.useState(status ? Boolean(status.should_send_message) : false);
  const [showSaveConfirmDialog, setShowSaveConfirmDialog] = React.useState(false);

  const handleCancel = () => {
    setStatusLabel('');
    setStatusMessageEnabled(false);
    setStatusColor('#567bff');
    onCancel();
  };

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
      <div className={cx(dialogStyles['dialog-content'], styles['edit-status-dialog'])}>
        <div className={inputStyles['form-fieldset']}>
          <div className={cx(inputStyles['form-fieldset-field'], styles['edit-status-label'])}>
            <FormattedMessage
              id="editStatusDialog.statusTitlePlaceholder"
              defaultMessage="Enter status label"
              description="Text field placeholder for the status name"
            >
              { placeholder => (
                <LimitedTextArea
                  required
                  value={status ? statusLabel : ''}
                  componentProps={{
                    id: 'edit-status-dialog__status-name',
                  }}
                  maxChars={35}
                  maxLength={35}
                  rows="1"
                  label={
                    <FormattedMessage
                      id="editStatusDialog.statusTitle"
                      defaultMessage="Status"
                      description="Text field label for the status name"
                    />
                  }
                  maxHeight="48px"
                  autoGrow={Boolean(false)}
                  placeholder={placeholder}
                  onBlur={(e) => {
                    setStatusLabel(e.target.value);
                  }}
                />
              )}
            </FormattedMessage>
            <ColorPicker
              color={statusColor}
              onChange={handleChangeColor}
            />
          </div>
          <TextArea
            className={inputStyles['form-fieldset-field']}
            componentProps={{
              id: 'edit-status-dialog__status-description',
            }}
            label={(
              <FormattedMessage
                id="editStatusDialog.statusDescription"
                defaultMessage="Description"
                description="Text field label for the status description value"
              />
            )}
            autoGrow
            rows="3"
            onBlur={(e) => {
              setStatusDescription(e.target.value);
            }}
            defaultValue={status ? statusDescription : ''}
          />
          { team.smooch_bot ?
            <React.Fragment>
              <SwitchComponent
                className={inputStyles['form-fieldset-field']}
                label={
                  <FormattedMessage
                    id="editStatusDialog.toggleStatusMessage"
                    defaultMessage="Send message to requester"
                    description="Checkbox option to send a message to the user who requested the item"
                  />
                }
                labelPlacement="end"
                helperContent={
                  <FormattedMessage
                    id="editStatusDialog.messageDescription"
                    defaultMessage="Send a message to the user who requested the item when you change an item to this status."
                    description="Accompanying description for editStatusDialog.toggleStatusMessage"
                  />
                }
                checked={statusMessageEnabled}
                onChange={() => setStatusMessageEnabled(!statusMessageEnabled)}
              />
              { statusMessageEnabled &&
                <TextArea
                  className={inputStyles['form-fieldset-field']}
                  componentProps={{
                    id: 'edit-status-dialog__status-message',
                  }}
                  label={(
                    <FormattedMessage
                      id="editStatusDialog.statusMessage"
                      defaultMessage="Message"
                      description="Text field label for the message that will be sent to the user when an item is changed to this status value"
                    />
                  )}
                  autoGrow={Boolean(true)}
                  rows="5"
                  onBlur={(e) => {
                    setStatusMessage(e.target.value);
                  }}
                  disabled={!statusMessageEnabled}
                  defaultValue={status ? statusMessage : ''}
                />
              }
            </React.Fragment> : null }
        </div>
      </div>
      <div className={dialogStyles['dialog-actions']}>
        <ButtonMain
          className="edit-status-dialog__dismiss"
          onClick={handleCancel}
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
