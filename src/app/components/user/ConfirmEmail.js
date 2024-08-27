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
      buttonLabel={<FormattedMessage defaultMessage="Resend" description="Button label to allow the user to resend their email address confirmation" id="ConfirmEmail.resendConfirmation" />}
      contained
      content={
        <FormattedMessage
          defaultMessage="Please check your email to verify your account."
          description="Message to the user to check their email inbox in order to verify their application account"
          id="ConfirmEmail.content"
        />
      }
      title={<FormattedMessage defaultMessage="Confirm your email" description="Container title for confirming user email address" id="ConfirmEmail.title" />}
      variant="warning"
      onButtonClick={handleResend}
    />
  );
};

export default ConfirmEmail;
