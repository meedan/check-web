const UserUtil = {
  userRole: function(user, team) {
    if (!(user && user.team_users) || !(team && team.slug)) {
      return null;
    }

    const current_team_user = user.team_users.edges.find(tu => tu.node.team.slug === team.slug);
    return current_team_user && current_team_user.node.status !== 'requested' ? current_team_user.node.role : '';
  },
};

export default UserUtil;
