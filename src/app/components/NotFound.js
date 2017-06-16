import React, {Component, PropTypes} from 'react';
import {FormattedMessage} from 'react-intl';
import ContentColumn from './layout/ContentColumn';

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
