import React, { Component } from 'react';
import { bemClass } from '../../helpers';

class ContentColumn extends Component {
  render() {
    const { flex, wide, narrow, className } = this.props;
    const classNames = [];
    classNames.push('content-column');
    if (narrow) { classNames.push(bemClass('content-column', narrow, '--narrow')); }
    if (flex) { classNames.push(bemClass('content-column', flex, '--flex')); }
    if (wide) { classNames.push(bemClass('content-column', wide, '--wide')); }
    classNames.push(className || '');

    return (
      <div className={classNames.join(' ')} style={this.props.style} id={this.props.id}>
        {this.props.children}
      </div>
    );
  }
}

export default ContentColumn;
