import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router';

class UserUnconfirmed extends Component {
  render() {
    return (
      <div>
        <h2 className="main-title"><FormattedMessage id="userUnconfirmed.heading" defaultMessage="Error" /></h2>
        <p><FormattedMessage id="userUnconfirmed.message" defaultMessage="Your account could not be confirmed. Please contact the support." /></p>
      </div>
    );
  }
}

export default UserUnconfirmed;
