import React, { Component, PropTypes } from 'react';
import mui from 'material-ui';
import MdMoreHoriz from 'react-icons/lib/md/more-horiz';
import { bemClass } from '../helpers';

class MenuButton extends Component { // => AnnotationActions?
  constructor(props) {
    super(props);

    this.state = {
      isMenuOpen: false,
    };
  }

  toggleMenu() {
    this.setState({ isMenuOpen: !this.state.isMenuOpen });
  }

  render() {
    return this.props.children ? (
      <span className={bemClass('menu-button', this.state.isMenuOpen, '--active')}>
        <MdMoreHoriz className="menu-button__icon" onClick={this.toggleMenu.bind(this)} />
        <div className={bemClass('menu-button__overlay', this.state.isMenuOpen, '--active')} onClick={this.toggleMenu.bind(this)} />
        <ul className={bemClass('menu-button__menu', this.state.isMenuOpen, '--active')}>
          {this.props.children}
        </ul>
      </span>
    ) : null;
  }
}

export default MenuButton;
