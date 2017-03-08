import React, { Component, PropTypes } from 'react';
import { bemClass } from '../../helpers';

class ContentColumn extends Component {
  render() {
    const { flex } = this.props;

    return (
      <div className={bemClass('content-column', flex, '--flex')}>
        {this.props.children}
      </div>
    );
  }
}

export default ContentColumn;
