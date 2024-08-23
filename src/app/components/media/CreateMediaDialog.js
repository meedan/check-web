/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import CreateMediaInput from './CreateMediaInput';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import IconClose from '../../icons/clear.svg';
import styles from '../../styles/css/dialog.module.css';

export default function CreateMediaDialog({
  onDismiss, onSubmit, open, team, title,
}) {
  const formId = 'create-media-dialog-form';

  return (
    <Dialog className={styles['dialog-window']} fullWidth open={open}>
      <div className={styles['dialog-title']}>
        {title}
        <ButtonMain
          className={styles['dialog-close-button']}
          iconCenter={<IconClose />}
          size="small"
          theme="text"
          variant="text"
          onClick={onDismiss}
        />
      </div>
      <div className={styles['dialog-content']}>
        <CreateMediaInput formId={formId} team={team} onSubmit={onSubmit} />
      </div>
      <div className={styles['dialog-actions']}>
        <ButtonMain
          buttonProps={{
            id: 'create-media-dialog__dismiss-button',
          }}
          label={
            <FormattedMessage defaultMessage="Cancel" description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation" id="global.cancel" />
          }
          size="default"
          theme="lightText"
          variant="text"
          onClick={onDismiss}
        />
        <ButtonMain
          buttonProps={{
            id: 'create-media-dialog__submit-button',
            form: formId,
            type: 'submit',
          }}
          label={
            <FormattedMessage defaultMessage="Submit" description="Generic label for a button or link for a user to press when they wish to submit and form or action" id="global.submit" />
          }
          size="default"
          theme="info"
          variant="contained"
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
