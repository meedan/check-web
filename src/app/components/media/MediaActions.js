import React, { Component, PropTypes } from 'react';
import FontAwesome from 'react-fontawesome';
import { can } from '../Can';

class MediaActions extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isMenuOpen: false
    };
  }

  toggleMenu() {
    this.setState({ isMenuOpen: !this.state.isMenuOpen });
  }

  bemClass(baseClass, modifierBoolean, modifierSuffix) {
    return modifierBoolean ? [baseClass, baseClass + modifierSuffix].join(' ') : baseClass;
  }

  render() {
    const { media, handleEdit } = this.props;
    const menuItems = [];

    if (can(media.permissions, 'create Tag')) {
      menuItems.push(<li className='media-actions__menu-item' onClick={handleEdit}>Edit...</li>);
    }

    return menuItems.length ? (
      <div className={this.bemClass('media-actions', this.state.isMenuOpen, '--active')}>
        <FontAwesome name='ellipsis-h' className='media-actions__icon' onClick={this.toggleMenu.bind(this)} />
        <div className={this.bemClass('media-actions__overlay', this.state.isMenuOpen, '--active')} onClick={this.toggleMenu.bind(this)}></div>
        <ul className={this.bemClass('media-actions__menu', this.state.isMenuOpen, '--active')}>
          {menuItems}
        </ul>
      </div>
    ) : null;
  }
}

export default MediaActions;
