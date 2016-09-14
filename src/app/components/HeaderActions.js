import React, { Component, PropTypes } from 'react';
import UserMenuRelay from '../relay/UserMenuRelay';
import { logout } from '../actions/actions';

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

  render() {
    const project = this.props.project;

    return (
      <div className={this.bemClass('project-header__project-settings', this.state.isSettingsMenuOpen, '--active')}>
        <span style="position: absolute; top: 0; right: 15px; font-size: 10px; border-radius: 0 0 4px 4px; background-color: #c00000; color: white!important; padding: 2px 4px;">EARLY DEMO</span>
        <i className='project-header__project-search-icon fa fa-search'></i>
        <i className='project-header__project-settings-icon fa fa-gear' onClick={this.toggleSettingsMenu.bind(this)}></i>
        <div className={this.bemClass('project-header__project-settings-overlay', this.state.isSettingsMenuOpen, '--active')} onClick={this.toggleSettingsMenu.bind(this)}></div>
        <ul className={this.bemClass('project-header__project-settings-panel', this.state.isSettingsMenuOpen, '--active')}>
          <li className='TODO project-header__project-setting'><UserMenuRelay {...this.props} /></li>
          <li className='TODO project-header__project-setting' onClick={logout}>Sign Out</li>
        </ul>
      </div>
    );
  }
}

export default HeaderActions;
