/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import { FormattedGlobalMessage } from '../MappedMessage';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import Loader from '../cds/loading/Loader';
import IconClose from '../../icons/clear.svg';
import TextField from '../cds/inputs/TextField';
import styles from '../../styles/css/dialog.module.css';
import inputStyles from '../../styles/css/inputs.module.css';

const ConfirmProceedDialog = ({
  body,
  cancelLabel,
  isSaving,
  onCancel,
  onProceed,
  open,
  proceedDisabled,
  proceedLabel,
  title,
  typeTextToConfirm,
}) => {
  const [confirmationText, setConfirmationText] = React.useState('');

  return (
    <Dialog className={styles['dialog-window']} open={open}>
      <div className={styles['dialog-title']}>
        <h6>{title}</h6>
        { onCancel ?
          <ButtonMain
            className={styles['dialog-close-button']}
            iconCenter={<IconClose />}
            size="small"
            theme="text"
            variant="text"
            onClick={onCancel}
          /> : null }
      </div>
      <div className={styles['dialog-content']}>
        {body}
        { typeTextToConfirm ?
          <div className={inputStyles['form-fieldset']}>
            <div className={inputStyles['form-fieldset-field']}>
              <FormattedMessage defaultMessage="Type confirmation phrase here" description="Placeholder label for confirmation word input" id="confirmProceedDialog.confirmationTextPlaceholder">
                {placeholder => (
                  <TextField
                    componentProps={{
                      name: 'confirmation-text',
                      id: 'confirm-proceed-dialog__confirmation-text',
                    }}
                    helpContent={
                      <FormattedMessage
                        defaultMessage="Enter Confirmation Phrase"
                        description="Description to type into the input in order to continue"
                        id="confirmProceedDialog.confirmationTextfieldLabel"
                      />
                    }
                    key={typeTextToConfirm}
                    label={
                      <FormattedMessage
                        defaultMessage='Type "{text}" to confirm.'
                        description="Input label for confirmation word input"
                        id="confirmProceedDialog.confirmationText"
                        tagName="strong"
                        values={{ text: typeTextToConfirm }}
                      />
                    }
                    placeholder={placeholder}
                    required
                    value={confirmationText}
                    onChange={(e) => { setConfirmationText(e.target.value); }}
                  />
                )}
              </FormattedMessage>
            </div>
          </div> : null
        }
      </div>
      <div className={styles['dialog-actions']}>
        { onCancel ?
          <ButtonMain
            className="int-confirm-proceed-dialog__cancel"
            label={cancelLabel || <FormattedGlobalMessage messageKey="cancel" />}
            size="default"
            theme="lightText"
            variant="text"
            onClick={onCancel}
          /> : null }
        <ButtonMain
          buttonProps={{
            id: 'confirm-dialog__confirm-action-button',
          }}
          className="int-confirm-proceed-dialog__proceed"
          disabled={proceedDisabled || isSaving || confirmationText !== typeTextToConfirm}
          iconLeft={isSaving ? <Loader size="icon" theme="white" variant="icon" /> : null}
          label={proceedLabel}
          size="default"
          theme="info"
          variant="contained"
          onClick={onProceed}
        />
      </div>
    </Dialog>
  );
};

ConfirmProceedDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.node.isRequired,
  body: PropTypes.node.isRequired,
  cancelLabel: PropTypes.element,
  isSaving: PropTypes.bool,
  onCancel: PropTypes.func,
  onProceed: PropTypes.func.isRequired,
  proceedDisabled: PropTypes.bool,
  proceedLabel: PropTypes.node,
  typeTextToConfirm: PropTypes.string,
};

ConfirmProceedDialog.defaultProps = {
  onCancel: null,
  cancelLabel: null,
  proceedDisabled: false,
  isSaving: false,
  typeTextToConfirm: '',
  proceedLabel: (
    <FormattedMessage
      defaultMessage="Continue"
      description="Label for the dialog continuation button"
      id="confirmProceedDialog.continue"
    />
  ),
};

export default ConfirmProceedDialog;
