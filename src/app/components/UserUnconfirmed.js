import React from 'react';
import { FormattedMessage } from 'react-intl';
import { ContentColumn } from '../styles/js/shared';
import { stringHelper } from '../customHelpers';

const UserUnconfirmed = () => (
  <ContentColumn className="card">
    <h2 className="main-title"><FormattedMessage id="userUnconfirmed.heading" defaultMessage="Error" /></h2>
    <p>
      <FormattedMessage
        id="userUnconfirmed.message"
        defaultMessage="Sorry, an error occurred while confirming your account. Please try again and contact {supportEmail} if the condition persists."
        values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
      />
    </p>
  </ContentColumn>
);

export default UserUnconfirmed;
