import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import { FormattedGlobalMessage } from '../MappedMessage';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import MediasLoading from '../media/MediasLoading';
import IconClose from '../../icons/clear.svg';
import TextField from '../cds/inputs/TextField';
import styles from '../../styles/css/dialog.module.css';
import inputStyles from '../../styles/css/inputs.module.css';

const ConfirmProceedDialog = ({
  open,
  title,
  body,
  cancelLabel,
  isSaving,
  onCancel,
  onProceed,
  proceedDisabled,
  proceedLabel,
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
            variant="text"
            size="small"
            theme="text"
            iconCenter={<IconClose />}
            onClick={onCancel}
          /> : null }
      </div>
      <div className={styles['dialog-content']}>
        {body}
        { typeTextToConfirm ?
          <div className={inputStyles['form-fieldset']}>
            <div className={inputStyles['form-fieldset-field']}>
              <FormattedMessage id="confirmProceedDialog.confirmationTextPlaceholder" defaultMessage="Type confirmation phrase here" description="Placeholder label for confirmation word input">
                {placeholder => (
                  <TextField
                    required
                    key={typeTextToConfirm}
                    componentProps={{
                      name: 'confirmation-text',
                      id: 'confirm-proceed-dialog__confirmation-text',
                    }}
                    placeholder={placeholder}
                    value={confirmationText}
                    onChange={(e) => { setConfirmationText(e.target.value); }}
                    helpContent={
                      <FormattedMessage
                        id="confirmProceedDialog.confirmationTextfieldLabel"
                        defaultMessage="Enter Confirmation Phrase"
                        description="Description to type into the input in order to continue"
                      />
                    }
                    label={
                      <FormattedMessage
                        id="confirmProceedDialog.confirmationText"
                        tagName="strong"
                        defaultMessage='Type "{text}" to confirm.'
                        description="Input label for confirmation word input"
                        values={{ text: typeTextToConfirm }}
                      />
                    }
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
            size="default"
            variant="text"
            theme="lightText"
            onClick={onCancel}
            label={cancelLabel || <FormattedGlobalMessage messageKey="cancel" />}
          /> : null }
        <ButtonMain
          buttonProps={{
            id: 'confirm-dialog__confirm-action-button',
          }}
          className="int-confirm-proceed-dialog__proceed"
          size="default"
          variant="contained"
          theme="brand"
          disabled={proceedDisabled || isSaving || confirmationText !== typeTextToConfirm}
          iconLeft={isSaving ? <MediasLoading size="icon" theme="white" variant="icon" /> : null}
          onClick={onProceed}
          label={proceedLabel}
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
      id="confirmProceedDialog.continue"
      defaultMessage="Continue"
      description="Label for the dialog continuation button"
    />
  ),
};

export default ConfirmProceedDialog;
