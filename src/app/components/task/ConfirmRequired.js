import React from 'react';
import { FormattedHTMLMessage, defineMessages, injectIntl } from 'react-intl';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import globalStrings from '../../globalStrings';

const messages = defineMessages({
  title: {
    id: 'task.confirmRequiredTitle',
    defaultMessage: 'Confirm required task',
  },
});

const ConfirmRequired = (props) => {
  const actions = [
    <FlatButton
      label={props.intl.formatMessage(globalStrings.cancel)}
      onClick={props.handleCancel}
    />,
    <FlatButton
      className="create-task__confirm-required-button"
      label={props.intl.formatMessage(globalStrings.confirm)}
      primary
      keyboardFocused
      onClick={props.handleConfirm}
    />,
  ];

  return (
    <Dialog
      title={props.intl.formatMessage(messages.title)}
      actions={actions}
      {...props}
    >
      <FormattedHTMLMessage
        id="task.confirmRequiredText"
        defaultMessage="You are adding a required task to an item marked <strong>{status}</strong>. By adding this, you'll automatically change the status of this item back to <strong>In Progress</strong>"
        values={{ status: props.status && props.status.label }}
      />
    </Dialog>
  );
};

export default injectIntl(ConfirmRequired);
