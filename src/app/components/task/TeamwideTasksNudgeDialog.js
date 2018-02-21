import React from 'react';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';

const messages = defineMessages({
  nudgeTitle: {
    id: 'tasksNudge.nudgeTitle',
    defaultMessage: 'Upgrade to Check Pro',
  },
});

const TeamwideTasksNudgeDialog = (props) => {
  const actions = [
    <FlatButton
      label={
        <FormattedMessage id="tasksNudge.cancelButton" defaultMessage="No, thanks" />
      }
      onClick={props.onDismiss}
    />,
    <RaisedButton
      label={
        <FormattedMessage id="tasksNudge.upgradeButton" defaultMessage="Upgrade now" />
      }
      primary
    />,
  ];
  return (
    <div>
      <Dialog
        title={props.intl.formatMessage(messages.nudgeTitle)}
        open={props.open}
        modal={false}
        actions={actions}
        onRequestClose={props.onDismiss}
      >
        <FormattedMessage
          id="tasks.nudgeText"
          defaultMessage="To help you make consistent investigations, Check Pro allows you to create tasks that automatically appear for every item in a team or project."
        />
      </Dialog>
    </div>
  );
};

export default injectIntl(TeamwideTasksNudgeDialog);
