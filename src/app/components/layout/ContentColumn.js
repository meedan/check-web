import React, { Component } from 'react';
import { bemClass } from '../../helpers';

class ContentColumn extends Component {
  render() {
    const { flex, wide, narrow } = this.props;
    const classNames =
        `${bemClass('content-column', narrow, '--narrow')} ${
        bemClass('content-column', flex, '--flex')} ${
        bemClass('content-column', wide, '--wide')} ${
        this.props.className || ''}`;

    return (
      <div className={`${classNames} ${this.props.ClassName}`} style={this.props.style}>
        {this.props.children}
      </div>
    );
  }
}

export default ContentColumn;
