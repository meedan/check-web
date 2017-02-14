import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import mui from 'material-ui';
import NavigationMoreHoriz from 'react-material-icons/icons/navigation/more-horiz';
import { can } from '../Can';

class MediaActions extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isMenuOpen: false,
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
      menuItems.push(<li className="media-actions__menu-item" onClick={handleEdit}><FormattedMessage id="mediaActions.edit" defaultMessage="Edit..." /></li>);
    }

    return menuItems.length ? (
      <div className={this.bemClass('media-actions', this.state.isMenuOpen, '--active')}>
        <NavigationMoreHoriz className="media-actions__icon" onClick={this.toggleMenu.bind(this)} />
        <div className={this.bemClass('media-actions__overlay', this.state.isMenuOpen, '--active')} onClick={this.toggleMenu.bind(this)} />
        <ul className={this.bemClass('media-actions__menu', this.state.isMenuOpen, '--active')}>
          {menuItems}
        </ul>
      </div>
    ) : null;
  }
}

export default MediaActions;
