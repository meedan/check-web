import React from 'react';
import PropTypes from 'prop-types';

function can(permissionsData, permission) {
  try {
    const permissions = JSON.parse(permissionsData);
    return permissions[permission];
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`Error parsing permissions data: ${permissionsData}`);
  }
  return false;
}

export default function Can({
  permissions, permission, children, otherwise,
}) {
  return (
    <React.Fragment>
      {can(permissions, permission) ? children : otherwise}
    </React.Fragment>
  );
}
Can.defaultProps = {
  otherwise: null,
};
Can.propTypes = {
  permissions: PropTypes.string.isRequired, // e.g., '{"create Media":true}'
  permission: PropTypes.string.isRequired, // e.g., 'create Media'
  children: PropTypes.node.isRequired, // component to render if permitted
  otherwise: PropTypes.node, // component to render otherwise (or null)
};

export { can };
