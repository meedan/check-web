/* eslint-disable react/sort-prop-types */
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
import inputStyles from '../../../styles/css/inputs.module.css';
import styles from './Statuses.module.css';

const EditStatusDialog = ({
  defaultLanguage,
  defaultValue: status,
  onCancel,
  onSubmit,
  open,
  team,
}) => {
  const [statusLabel, setStatusLabel] = React.useState(status ? status.locales[defaultLanguage].label : '');
  const [statusDescription, setStatusDescription] = React.useState(status ? status.locales[defaultLanguage].description : '');
  const [statusColor, setStatusColor] = React.useState(status ? status.style.color : '#37a0de');
  const [statusMessage, setStatusMessage] = React.useState(status ? status.locales[defaultLanguage].message : '');
  const [statusMessageEnabled, setStatusMessageEnabled] = React.useState(status ? Boolean(status.should_send_message) : false);
  const [showSaveConfirmDialog, setShowSaveConfirmDialog] = React.useState(false);

  const handleCancel = () => {
    setStatusLabel('');
    setStatusMessageEnabled(false);
    setStatusColor('#37a0de'); // this cannot be a CSS variable
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
      fullWidth
      maxWidth="xs"
      open={open}
    >
      <div className={dialogStyles['dialog-title']}>
        { status ? (
          <FormattedMessage
            defaultMessage="Edit status"
            description="Dialog title for editing a status message"
            id="editStatusDialog.titleEdit"
            tagName="h6"
          />
        ) : (
          <FormattedMessage
            defaultMessage="Add a new status"
            description="Dialog title for adding a new status message"
            id="editStatusDialog.title"
            tagName="h6"
          />
        )}
      </div>
      <div className={cx(dialogStyles['dialog-content'], styles['edit-status-dialog'])}>
        <div className={inputStyles['form-fieldset']}>
          <div className={cx(inputStyles['form-fieldset-field'], styles['edit-status-label'])}>
            <FormattedMessage
              defaultMessage="Enter status label"
              description="Text field placeholder for the status name"
              id="editStatusDialog.statusTitlePlaceholder"
            >
              { placeholder => (
                <LimitedTextArea
                  autoGrow={Boolean(false)}
                  componentProps={{
                    id: 'edit-status-dialog__status-name',
                  }}
                  label={
                    <FormattedMessage
                      defaultMessage="Status"
                      description="Text field label for the status name"
                      id="editStatusDialog.statusTitle"
                    />
                  }
                  maxChars={35}
                  maxHeight="48px"
                  maxLength={35}
                  placeholder={placeholder}
                  required
                  rows="1"
                  value={status ? statusLabel : ''}
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
            autoGrow
            className={inputStyles['form-fieldset-field']}
            componentProps={{
              id: 'edit-status-dialog__status-description',
            }}
            defaultValue={status ? statusDescription : ''}
            label={(
              <FormattedMessage
                defaultMessage="Description"
                description="Text field label for the status description value"
                id="editStatusDialog.statusDescription"
              />
            )}
            rows="3"
            onBlur={(e) => {
              setStatusDescription(e.target.value);
            }}
          />
          { team.smooch_bot ?
            <React.Fragment>
              <SwitchComponent
                checked={statusMessageEnabled}
                className={inputStyles['form-fieldset-field']}
                helperContent={
                  <FormattedMessage
                    defaultMessage="Send a message to the user who requested the item when you change an item to this status."
                    description="Accompanying description for editStatusDialog.toggleStatusMessage"
                    id="editStatusDialog.messageDescription"
                  />
                }
                label={
                  <FormattedMessage
                    defaultMessage="Send message to requester"
                    description="Checkbox option to send a message to the user who requested the item"
                    id="editStatusDialog.toggleStatusMessage"
                  />
                }
                labelPlacement="end"
                onChange={() => setStatusMessageEnabled(!statusMessageEnabled)}
              />
              { statusMessageEnabled &&
                <TextArea
                  autoGrow={Boolean(true)}
                  className={inputStyles['form-fieldset-field']}
                  componentProps={{
                    id: 'edit-status-dialog__status-message',
                  }}
                  defaultValue={status ? statusMessage : ''}
                  disabled={!statusMessageEnabled}
                  label={(
                    <FormattedMessage
                      defaultMessage="Message"
                      description="Text field label for the message that will be sent to the user when an item is changed to this status value"
                      id="editStatusDialog.statusMessage"
                    />
                  )}
                  rows="5"
                  onBlur={(e) => {
                    setStatusMessage(e.target.value);
                  }}
                />
              }
            </React.Fragment> : null }
        </div>
      </div>
      <div className={dialogStyles['dialog-actions']}>
        <ButtonMain
          className="edit-status-dialog__dismiss"
          label={
            <FormattedGlobalMessage messageKey="cancel" />
          }
          size="default"
          theme="lightText"
          variant="text"
          onClick={handleCancel}
        />
        <ButtonMain
          className="edit-status-dialog__submit"
          disabled={!statusLabel}
          label={status ? (
            <FormattedGlobalMessage messageKey="save" />
          ) : (
            <FormattedMessage
              defaultMessage="Add status"
              description="Button label to add a new status"
              id="editStatusDialog.addButton"
            />
          )}
          size="default"
          theme="info"
          variant="contained"
          onClick={team.smooch_bot ? handleConfirmSubmit : handleSubmit}
        />
      </div>
      <ConfirmProceedDialog
        body={
          <FormattedMessage
            defaultMessage="Any published report with this status will be updated with the new label and paused."
            description="Confirmation dialog description"
            id="editStatusDialog.saveStatusMessage"
          />
        }
        open={showSaveConfirmDialog}
        title={
          <FormattedMessage
            defaultMessage="Save status"
            description="Confirmation dialog title. 'Save' here is in infinitive form."
            id="editStatusDialog.saveStatusTitle"
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
