import React, { Component, PropTypes } from 'react';
import UserMenuRelay from '../relay/UserMenuRelay';
import { logout } from '../actions/actions';
import FontAwesome from 'react-fontawesome';
import TeamMenuRelay from '../relay/TeamMenuRelay';
import { bemClass } from '../helpers';

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
        {/*<FontAwesome name='search' className='header-actions__search-icon'/>*/}

        <FontAwesome name='ellipsis-h' className='header-actions__menu-toggle' onClick={this.toggleSettingsMenu.bind(this)} />
        <div className={bemClass('header-actions__menu-overlay', this.state.isMenuOpen, '--active')} onClick={this.toggleSettingsMenu.bind(this)}></div>
        <ul className={bemClass('header-actions__menu', this.state.isMenuOpen, '--active')}>
          <li className='header-actions__menu-item'><UserMenuRelay {...this.props} /></li>
          <TeamMenuRelay />
          <li className='header-actions__menu-item' onClick={this.contactHuman.bind(this)}>Contact a Human</li>
          <li className='header-actions__menu-item header-actions__menu-item--logout' onClick={logout}>Sign Out</li>
          <li className='header-actions__menu-item'><a className='header-actions__link' href='/tos'>Terms of Service</a></li>
          <li className='header-actions__menu-item'><a className='header-actions__link' href='/privacy'>Privacy Policy</a></li>
          <li className='header-actions__menu-item'><a className='header-actions__link' href='http://meedan.com/check'>About Check</a></li>
        </ul>
      </div>
    );
  }
}

export default HeaderActions;
