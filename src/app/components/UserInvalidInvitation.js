import React from 'react';
import { FormattedMessage } from 'react-intl';
import { ContentColumn } from '../styles/js/shared';

const UserInvalidInvitation = () => (
  <ContentColumn className="card">
    <h2 className="main-title"><FormattedMessage id="userInvalidInvitation.heading" defaultMessage="Failed to accept your invitation" /></h2>
    <p>
      <FormattedMessage
        id="userInvalidInvitation.message"
        defaultMessage="Sorry could not accept your invitation, may be your invitaion expired or team not exists."
      />
    </p>
  </ContentColumn>);

export default UserInvalidInvitation;
