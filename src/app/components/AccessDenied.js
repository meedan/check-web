import React, { Component, PropTypes } from 'react';
import FormattedMessage from 'react-intl';

class AccessDenied extends Component {
  render() {
    return (<h2 className="main-title"><FormattedMessage id="accessDenied.title" defaultMessage="Access Denied"/></h2>);
  }
}

export default AccessDenied;
