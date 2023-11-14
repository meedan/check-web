import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import CreateMediaInput from './CreateMediaInput';
import IconClose from '../../icons/clear.svg';
import styles from '../../styles/css/dialog.module.css';

export default function CreateMediaDialog({
  open, title, onSubmit, onDismiss, team,
}) {
  const formId = 'create-media-dialog-form';

  return (
    <Dialog className={styles['dialog-window']} open={open} fullWidth>
      <div className={styles['dialog-title']}>
        {title}
        <ButtonMain
          className={styles['dialog-close-button']}
          variant="text"
          size="small"
          theme="text"
          iconCenter={<IconClose />}
          onClick={onDismiss}
        />
      </div>
      <div className={styles['dialog-content']}>
        <CreateMediaInput formId={formId} onSubmit={onSubmit} team={team} />
      </div>
      <div className={styles['dialog-actions']}>
        <ButtonMain
          buttonProps={{
            id: 'create-media-dialog__dismiss-button',
          }}
          onClick={onDismiss}
          size="default"
          variant="text"
          theme="lightText"
          label={
            <FormattedMessage id="global.cancel" defaultMessage="Cancel" description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation" />
          }
        />
        <ButtonMain
          buttonProps={{
            id: 'create-media-dialog__submit-button',
            form: formId,
            type: 'submit',
          }}
          size="default"
          variant="contained"
          theme="brand"
          label={
            <FormattedMessage id="global.submit" defaultMessage="Submit" description="Generic label for a button or link for a user to press when they wish to submit and form or action" />
          }
        />
      </div>
    </Dialog>
  );
}
CreateMediaDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.node.isRequired, // <FormattedMessage>
  onSubmit: PropTypes.func.isRequired, // func({ ... }) => undefined
  onDismiss: PropTypes.func.isRequired, // func() => undefined
};
