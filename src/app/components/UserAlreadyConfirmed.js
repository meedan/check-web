import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router';
import ContentColumn from './layout/ContentColumn';

class UserAlreadyConfirmed extends Component {
  render() {
    return (
      <ContentColumn className="card">
        <h2 className="main-title"><FormattedMessage id="userAlreadyConfirmed.heading" defaultMessage="Account Already Confirmed" /></h2>
        <p>
          <FormattedMessage
            id="userAlreadyConfirmed.message"
            defaultMessage={'Oops! Your account is already confirmed. Please {login} to get started.'}
            values={{ login: <Link to="/"><FormattedMessage id="userAlreadyConfirmed.login" defaultMessage="login" /></Link> }}
          />
        </p>
      </ContentColumn>
    );
  }
}

export default UserAlreadyConfirmed;
