import React, { Component, PropTypes } from 'react';
import { bemClass } from '../../helpers';

class DefaultButton extends Component {
  render() {
    const buttonClassName = `${bemClass('default-button', this.props.size, `--${this.props.size}`)} default-button--${this.props.style}`;

    return (
      <span className={this.props.className}>
        <button type="submit" onClick={this.props.onClick} className={buttonClassName}>{this.props.children}</button>
      </span>
    );
  }
}

export default DefaultButton;
