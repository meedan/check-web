import React from 'react';
import { FormattedMessage } from 'react-intl';
import { ContentColumn } from '../styles/js/shared';

const NotFound = () =>
  <ContentColumn className="card">
    <h2 className="main-title">
      <FormattedMessage id="notFound.title" defaultMessage="Not Found" />
    </h2>
  </ContentColumn>
;

export default NotFound;
