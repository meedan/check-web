import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

class NotFound extends Component {
  render() {
    return (<h2 className="main-title"><FormattedMessage id="notFound.title" defaultMessage="Not Found" /></h2>);
  }
}

export default NotFound;
