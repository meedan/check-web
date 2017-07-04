export function profileLink(user) {
  if (
      user &&
      user.source &&
      user.source.accounts &&
      user.source.accounts.edges &&
      user.source.accounts.edges.length > 0
    ) {
    return user.source.accounts.edges[0].node.url;
  }
  return null;
}
