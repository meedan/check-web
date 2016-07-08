import React, { Component, PropTypes } from 'react';
import UserMenuRelay from '../relay/UserMenuRelay';

class Header extends Component {
  render() {
    const { state, logout } = this.props;
    return (
      <header>
        {(() => {
          if (state.app.token) {
            return (
              <div>
                <UserMenuRelay {...this.props} />
                <span onClick={logout}>Logout</span>
              </div>
            );
          }
          else {
            return null;
          }
        })()}
      </header>
    );
  }
}

export default Header;
