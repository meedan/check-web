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

const Can = (props) => {
  if (can(props.permissions, props.permission)) {
    return props.children;
  }
  return props.otherwise || null;
};

export { Can as default, can };
