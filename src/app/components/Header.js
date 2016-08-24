import React, { Component, PropTypes } from 'react';
import UserMenuRelay from '../relay/UserMenuRelay';
import FlatButton from 'material-ui/lib/flat-button';
import ProjectHeader from './project/ProjectHeader';

class Header extends Component {
  render() {
    const { state, logout } = this.props;

    if (!state.app.token) {
      return null;
    }

    return (
      <header className='header'>
        <div className='header__sidebar-toggle'>
          <img className='header__sidebar-toggle-button' src={this.props.team.avatar} />
        </div>
        <div>
          <UserMenuRelay {...this.props} />
          <FlatButton label="Logout" onClick={logout} />
        </div>
      </header>
    );
  }
}

export default Header;
