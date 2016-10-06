import React, { Component, PropTypes } from 'react';
import UserMenuRelay from '../relay/UserMenuRelay';
import { logout } from '../actions/actions';
import FontAwesome from 'react-fontawesome';

class HeaderActions extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isSettingsMenuOpen: false,
    };
  }

  toggleSettingsMenu() {
    this.setState({ isSettingsMenuOpen: !this.state.isSettingsMenuOpen });
  }

  bemClass(baseClass, modifierBoolean, modifierSuffix) {
    return modifierBoolean ? [baseClass, baseClass + modifierSuffix].join(' ') : baseClass;
  }

  contactHuman() {
    window.location.href = 'mailto:check@meedan.com?subject=Support Request for Check';
  }

  render() {
    const project = this.props.project;

    return (
      <div className={this.bemClass('header-actions', this.state.isSettingsMenuOpen, '--active')}>
        {/*<FontAwesome name='search' className='header-actions__search-icon'/>*/}

        {/* TODO: rename to reflect expand role (not just settings) */}
        <FontAwesome name='ellipsis-h' className='header-actions__settings-icon' onClick={this.toggleSettingsMenu.bind(this)} />
        <div className={this.bemClass('header-actions__settings-overlay', this.state.isSettingsMenuOpen, '--active')} onClick={this.toggleSettingsMenu.bind(this)}></div>
        <ul className={this.bemClass('header-actions__settings-panel', this.state.isSettingsMenuOpen, '--active')}>
          <li className='header-actions__setting'><UserMenuRelay {...this.props} /></li>
          <li className='header-actions__setting' onClick={this.contactHuman.bind(this)}>Contact a Human</li>
          <li className='header-actions__setting' onClick={logout}>Sign Out</li>
          <li className='header-actions__setting'><a className='header-actions__link' href='/tos'>Terms of Service</a></li>
          <li className='header-actions__setting'><a className='header-actions__link' href='/privacy'>Privacy Policy</a></li>
        </ul>
      </div>
    );
  }
}

export default HeaderActions;
