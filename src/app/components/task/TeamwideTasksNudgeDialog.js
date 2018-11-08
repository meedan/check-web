import React from 'react';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { stringHelper } from '../../customHelpers';

const messages = defineMessages({
  nudgeTitle: {
    id: 'tasksNudge.nudgeTitle',
    defaultMessage: 'Upgrade to Check Pro',
  },
});

const TeamwideTasksNudgeDialog = (props) => {
  const handleClickUpgrade = () => {
    window.open(stringHelper('UPGRADE_URL'));
    if (props.onDismiss) {
      props.onDismiss();
    }
  };

  const actions = [
    <FlatButton
      label={
        <FormattedMessage id="tasksNudge.cancelButton" defaultMessage="No thanks" />
      }
      onClick={props.onDismiss}
    />,
    <FlatButton
      label={
        <FormattedMessage id="tasksNudge.upgradeButton" defaultMessage="Upgrade now" />
      }
      onClick={handleClickUpgrade}
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
