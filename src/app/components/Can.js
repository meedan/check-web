/* eslint-disable react/sort-prop-types */
import PropTypes from 'prop-types';

/**
 * Return `true` if `permissionsData` includes `permission`.
 */
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

/**
 * Render `children` if the permissions allow. Else render `otherwise`
 * (which may be null).
 *
 * This does not forward a ref to its child. Don't use it when that matters. In
 * particular, do not wrap a `<MenuItem>` in a `<Can>`. (use `can()` instead.)
 */
const Can = ({
  children, otherwise, permission, permissions,
}) => can(permissions, permission) ? children : otherwise;
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
export default Can;
