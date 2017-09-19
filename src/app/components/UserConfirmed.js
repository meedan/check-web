import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router';
import { ContentColumn } from '../styles/js/shared';

class UserConfirmed extends Component {
  render() {
    return (
      <ContentColumn className="card">
        <h2 className="main-title"><FormattedMessage id="userConfirmed.heading" defaultMessage="Account Confirmed" /></h2>
        <p>
          <FormattedMessage
            id="userConfirmed.message"
            defaultMessage={'Thanks for confirming your e-mail address! Now you can {login}.'}
            values={{ login: <Link to="/"><FormattedMessage id="userConfirmed.login" defaultMessage="login" /></Link> }}
          />
        </p>
      </ContentColumn>
    );
  }
}

export default UserConfirmed;
