import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import Alert from '../cds/alerts-and-prompts/Alert';

const UserEmail = () => (
  <Alert
    contained
    content={
      <FormattedMessage
        defaultMessage="To send you notifications, we need your email address. If you'd like to receive notifications, please enter your email address."
        description="Message to the user on how to receive notifications to their email address"
        id="userEmail.text"
      />
    }
    title={<FormattedMessage defaultMessage="Add your email" description="Alert title for prompting the user to add their email address in order to receive notifications" id="userEmail.alertTitle" />}
    variant="warning"
  />
);

export default injectIntl(UserEmail);
