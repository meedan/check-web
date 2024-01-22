import React from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import Alert from '../cds/alerts-and-prompts/Alert';
import ResendConfirmationMutation from '../../relay/mutations/ResendConfirmationMutation';

// TODO Fix a11y issues
/* eslint jsx-a11y/click-events-have-key-events: 0 */
const ConfirmEmail = (props) => {
  function handleResend() {
    Relay.Store.commitUpdate(new ResendConfirmationMutation({
      user: props.user,
    }));
  }

  return (
    <Alert
      variant="warning"
      title={<FormattedMessage id="ConfirmEmail.title" defaultMessage="Confirm your email" description="Container title for confirming user email address" />}
      content={
        <FormattedMessage
          id="ConfirmEmail.content"
          defaultMessage="Please check your email to verify your account."
          description="Message to the user to check their email inbox in order to verify their application account"
        />
      }
      buttonLabel={<FormattedMessage id="ConfirmEmail.resendConfirmation" defaultMessage="Resend" description="Button label to allow the user to resend their email address confirmation" />}
      onButtonClick={handleResend}
    />
  );
};

export default ConfirmEmail;
