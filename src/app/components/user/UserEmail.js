import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import Alert from '../cds/alerts-and-prompts/Alert';

const UserEmail = () => (
  <Alert
    contained
    variant="warning"
    title={<FormattedMessage id="userEmail.alertTitle" defaultMessage="Add your email" description="Alert title for prompting the user to add their email address in order to receive notifications" />}
    content={
      <FormattedMessage
        id="userEmail.text"
        defaultMessage="To send you notifications, we need your email address. If you'd like to receive notifications, please enter your email address."
        description="Message to the user on how to receive notifications to their email address"
      />
    }
  />
);

export default injectIntl(UserEmail);
