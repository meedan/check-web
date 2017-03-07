import React, { Component, PropTypes } from 'react';

class CloseButton extends Component {
  render() {
    const { onClick } = this.props;

    return (
      <button className="close-button" onClick={onClick} title="Close">×</button>
    );
  }
}

export default CloseButton;
