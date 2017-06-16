import React, {Component, PropTypes} from 'react';
import {FormattedMessage} from 'react-intl';
import ContentColumn from './layout/ContentColumn';

class AccessDenied extends Component {
  render() {
    return (
      <ContentColumn className="card">
        <h2 className="main-title">
          <FormattedMessage id="accessDenied.title" defaultMessage="Access Denied" />
        </h2>
      </ContentColumn>
    );
  }
}

export default AccessDenied;
