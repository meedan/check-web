import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router';

class UserConfirmed extends Component {
  render() {
    return (
      <div>
        <h2 className="main-title"><FormattedMessage id="userConfirmed.heading" defaultMessage="Account Confirmed" /></h2>
        <p>
          <FormattedMessage
            id="userConfirmed.message"
            defaultMessage={'Thanks for confirming your e-mail address! Now you can {login}.'}
            values={{ login: <Link to="/"><FormattedMessage id="userConfirmed.login" defaultMessage="login" /></Link> }}
          />
        </p>
      </div>
    );
  }
}

export default UserConfirmed;
