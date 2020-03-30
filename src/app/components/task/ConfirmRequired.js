import React from 'react';
import { FormattedHTMLMessage, defineMessages, injectIntl } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import globalStrings from '../../globalStrings';

const messages = defineMessages({
  title: {
    id: 'task.confirmRequiredTitle',
    defaultMessage: 'Confirm required task',
  },
});

const ConfirmRequired = (props) => {
  const actions = [
    <Button onClick={props.handleCancel}>
      {props.intl.formatMessage(globalStrings.cancel)}
    </Button>,
    <Button
      className="create-task__confirm-required-button"
      color="primary"
      onClick={props.handleConfirm}
    >
      {props.intl.formatMessage(globalStrings.confirm)}
    </Button>,
  ];

  return (
    <Dialog
      {...props}
    >
      <DialogTitle>{props.intl.formatMessage(messages.title)}</DialogTitle>
      <DialogContent>
        <FormattedHTMLMessage
          id="task.confirmRequiredText"
          defaultMessage="You are adding a required task to an item marked <strong>{status}</strong>. By doing so, the item will automatically be reverted to its original status."
          values={{ status: props.status && props.status.label }}
        />
      </DialogContent>
      <DialogActions>{actions}</DialogActions>
    </Dialog>
  );
};

export default injectIntl(ConfirmRequired);
