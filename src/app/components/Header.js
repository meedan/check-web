import React, { Component, PropTypes } from 'react';
import UserMenuRelay from '../relay/UserMenuRelay';
import FlatButton from 'material-ui/lib/flat-button';

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
                <FlatButton label="Logout" onClick={logout} />
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
