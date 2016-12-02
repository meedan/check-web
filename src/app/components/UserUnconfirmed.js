import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

class UserUnconfirmed extends Component {
  render() {
    return (
      <div>
        <h2 className="main-title">Error</h2>
        <p>Your account could not be confirmed. Please contact the support.</p>
      </div>
    );
  }
}

export default UserUnconfirmed;
