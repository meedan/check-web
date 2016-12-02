import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

class UserConfirmed extends Component {
  render() {
    return (
      <div>
        <h2 className="main-title">Account Confirmed</h2>
        <p>Thanks for confirming your e-mail address! Now you can <Link to="/">login</Link>.</p>
      </div>
    );
  }
}

export default UserConfirmed;
