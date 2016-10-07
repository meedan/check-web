import React, { Component, PropTypes } from 'react';

function can(permissionsData, permission) {
  const permissions = JSON.parse(permissionsData);
  return permissions[permission];
}

class Can extends Component {
  render() {
    if (can(this.props.permissions, this.props.permission)) {
      return (this.props.children);
    }
    else {
      return null;
    }
  }
}

export { Can as default, can };
