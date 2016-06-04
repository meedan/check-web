import React, { Component, PropTypes } from 'react';

class TopBar extends Component {
  render() {
    return (
      <div className="top-bar">
        <a onClick={this.props.close}>
          Close
        </a>
      </div>
    );
  }
}

export default TopBar;
