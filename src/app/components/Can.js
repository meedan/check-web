import React, { Component, PropTypes } from 'react';

class Can extends Component {
  can(permission) {
    const permissions = JSON.parse(this.props.permissions);
    return permissions[permission];
  }

  render() {
    if (this.can(this.props.permission)) {
      return (this.props.children);
    }
    else {
      return null;
    }
  }
}

export default Can;
