import React from 'react';
import Relay from 'react-relay';
import { FormattedHTMLMessage, FormattedMessage, injectIntl } from 'react-intl';
import styled from 'styled-components';
import ResendConfirmationMutation from '../../relay/mutations/ResendConfirmationMutation';
import {
  units,
} from '../../styles/js/shared';

const StyledUserConfirmation = styled.div`
  .userinfo__resend-confirmation {
    cursor: pointer;
    display: inline-block;
    font-weight: 700;
    margin: 0 ${units(1)};
    text-transform: uppercase;
  }
`;

// TODO Fix a11y issues
/* eslint jsx-a11y/click-events-have-key-events: 0 */
const UserUnconfirmedEmail = (props) => {
  function handleResend() {
    Relay.Store.commitUpdate(new ResendConfirmationMutation({
      user: props.user,
    }));
  }

  return props.user.unconfirmed_email ?
    <StyledUserConfirmation>
      <FormattedHTMLMessage
        id="UserInfo.confirmEmail"
        defaultMessage="Email address <code>{unconfirmedEmail}</code> unconfirmed. Click Resend to resend a confirmation email to this address."
        values={{
          unconfirmedEmail: props.user.unconfirmed_email,
        }}
      />
      <span
        className="userinfo__resend-confirmation"
        onClick={handleResend}
      >
        <FormattedMessage id="UserInfo.resendConfirmation" defaultMessage="Resend" />
      </span>
    </StyledUserConfirmation>
    :
    null;
};

export default injectIntl(UserUnconfirmedEmail);
