import React from 'react';
import { FormattedMessage } from 'react-intl';
import { ContentColumn } from '../styles/js/shared';

const AccessDenied = () =>
  <ContentColumn className="card">
    <h2 className="main-title">
      <FormattedMessage id="accessDenied.title" defaultMessage="Access Denied" />
    </h2>
  </ContentColumn>;

export default AccessDenied;
