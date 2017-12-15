import { defineMessages } from 'react-intl';

const messages = defineMessages({
  contributor: {
    id: 'UserUtil.contributor',
    defaultMessage: 'Contributor',
  },
  journalist: {
    id: 'UserUtil.journalist',
    defaultMessage: 'Journalist',
  },
  editor: {
    id: 'UserUtil.editor',
    defaultMessage: 'Editor',
  },
  owner: {
    id: 'UserUtil.owner',
    defaultMessage: 'Owner',
  },
});

const UserUtil = {
  userRole: function(user, team) {
    if (!(user && user.team_users) || !(team && team.slug)) {
      return null;
    }

    const current_team_user = user.team_users.edges.find(tu => tu.node.team.slug === team.slug);
    return current_team_user && current_team_user.node.status !== 'requested' ? current_team_user.node.role : '';
  },

  localizedRole: function(role, intl) {
    return role ? `${intl.formatMessage(messages[role])}` : '';
  },
};

export default UserUtil;
