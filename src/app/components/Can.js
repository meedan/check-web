import React, { Component } from 'react';

function can(permissionsData, permission) {
  try {
    const permissions = JSON.parse(permissionsData);
    return permissions[permission];
  } catch (e) {
    throw `Error parsing permissions data: ${permissionsData}`;
  }
}

class Can extends Component {
  render() {
    if (can(this.props.permissions, this.props.permission)) {
      return this.props.children;
    }
    return this.props.otherwise || null;
  }
}

export { Can as default, can };
