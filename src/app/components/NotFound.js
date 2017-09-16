import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { ContentColumn } from '../styles/js/shared';

class NotFound extends Component {
  render() {
    return (
      <ContentColumn className="card">
        <h2 className="main-title">
          <FormattedMessage id="notFound.title" defaultMessage="Not Found" />
        </h2>
      </ContentColumn>
    );
  }
}

export default NotFound;
