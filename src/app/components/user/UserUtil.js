import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages } from 'react-intl';
import { safelyParseJSON } from '../../helpers';

const messages = defineMessages({
  annotator: {
    id: 'UserUtil.annotator',
    defaultMessage: 'Annotator',
  },
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

const LocalizedRole = ({ role }) => role ? <FormattedMessage {...messages[role]} /> : null;
LocalizedRole.propTypes = {
  role: PropTypes.oneOf(Object.keys(messages)).isRequired,
};

const userRole = (user, team) => {
  if (!(user && user.team_users) || !(team && team.slug)) {
    return null;
  }

  const current_team_user = user.team_users.edges.find(tu => tu.node.team.slug === team.slug);
  return current_team_user && current_team_user.node.status !== 'requested' ? current_team_user.node.role : '';
};

const UserUtil = {
  myRole: (currentUser, teamSlug) => {
    if (!currentUser) return null;
    const teams = safelyParseJSON(currentUser.teams);
    return teams[teamSlug] && teams[teamSlug].role;
  },

  userRole,
  localizedRole: (role, intl) => role ? `${intl.formatMessage(messages[role])}` : '',
};

export default UserUtil;
export { userRole, LocalizedRole };
