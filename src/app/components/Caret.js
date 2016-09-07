import React, { Component, PropTypes } from 'react';
import FontAwesome from 'react-fontawesome';

class Caret extends Component {
  render() {
    const caret = this.props.left ?
      <FontAwesome className='caret caret--left' name='angle-left' /> :
      <FontAwesome className='caret caret--right' name='angle-right' />;

    return caret;
  }
}

export default Caret;
