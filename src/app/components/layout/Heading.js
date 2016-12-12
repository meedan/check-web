import React, { Component, PropTypes } from 'react';

class Heading extends Component {
  render() {
    return (
      <h1 className='heading'>{this.props.children}</h1>
    );
  }
}

export default Heading;
