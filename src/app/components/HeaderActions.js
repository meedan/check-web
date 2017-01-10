import React, { Component, PropTypes } from 'react';
import UserMenuRelay from '../relay/UserMenuRelay';
import { logout } from '../actions/actions';
import FontAwesome from 'react-fontawesome';
import TeamMenuRelay from '../relay/TeamMenuRelay';
import { bemClass } from '../helpers';
import { Link } from 'react-router';

class HeaderActions extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isMenuOpen: false,
    };
  }

  toggleSettingsMenu() {
    this.setState({ isMenuOpen: !this.state.isMenuOpen });
  }

  contactHuman() {
    window.location.href = 'mailto:check@meedan.com?subject=Support Request for Check';
  }

  render() {
    const project = this.props.project;

    return (
      <div className={bemClass('header-actions', this.state.isMenuOpen, '--active')}>
        <Link to="/search"><FontAwesome name="search" className="header-actions__search-icon" /></Link>
        <FontAwesome name="ellipsis-h" className="header-actions__menu-toggle" onClick={this.toggleSettingsMenu.bind(this)} />
        <div className={bemClass('header-actions__menu-overlay', this.state.isMenuOpen, '--active')} onClick={this.toggleSettingsMenu.bind(this)} />
        <ul className={bemClass('header-actions__menu', this.state.isMenuOpen, '--active')}>
          <li className="header-actions__menu-item"><UserMenuRelay {...this.props} /></li>
          <TeamMenuRelay />
          <li className="header-actions__menu-item" onClick={this.contactHuman.bind(this)}>Contact a Human</li>
          <li className="header-actions__menu-item header-actions__menu-item--logout" onClick={logout}>Sign Out</li>
          <li className="header-actions__menu-item"><Link className="header-actions__link" to="/tos">Terms of Service</Link></li>
          <li className="header-actions__menu-item"><Link className="header-actions__link" to="/privacy">Privacy Policy</Link></li>
          <li className="header-actions__menu-item"><a className="header-actions__link" target="_blank" rel="noopener noreferrer" href="http://meedan.com/check">About Check</a></li>
        </ul>
      </div>
    );
  }
}

export default HeaderActions;
