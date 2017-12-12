const UserUtil = {
  userRole: function(user, team) {
    const current_team_user = user.team_users.edges.find(tu => tu.node.team.slug === team.slug);
    return current_team_user.node.status !== 'requested' ? current_team_user.node.role : '';
  },
};

export default UserUtil;
