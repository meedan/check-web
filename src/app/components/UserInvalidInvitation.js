import React from 'react';
import { FormattedMessage } from 'react-intl';
import { ContentColumn } from '../styles/js/shared';

const UserInvalidInvitation = () => (
  <ContentColumn className="card">
    <h2 className="main-title"><FormattedMessage id="userInvalidInvitation.heading" defaultMessage="An error occurred while processing your invitation. Please try again and contact the support team if the issue persists" /></h2>
    <p>
      <FormattedMessage
        id="userInvalidInvitation.message"
        defaultMessage="An error occurred while processing your invitation. Please make sure the invitation has not expired and that the team still exists. Contact the support team if the issue persists."
      />
    </p>
  </ContentColumn>);

export default UserInvalidInvitation;
