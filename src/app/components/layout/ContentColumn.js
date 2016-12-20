import React, { Component, PropTypes } from 'react';

class ContentColumn extends Component {
  render() {
    return (
      <div className="content-column">
        {this.props.children}
      </div>
    );
  }
}

export default ContentColumn;
