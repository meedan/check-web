function can(permissionsData, permission) {
  try {
    const permissions = JSON.parse(permissionsData);
    return permissions[permission];
  } catch (e) {
    throw new Error(`Error parsing permissions data: ${permissionsData}`);
  }
}

const Can = (props) => {
  if (can(props.permissions, props.permission)) {
    return props.children;
  }
  return props.otherwise || null;
};

export { Can as default, can };
