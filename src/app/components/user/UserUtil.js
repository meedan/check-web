/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages } from 'react-intl';
import { safelyParseJSON } from '../../helpers';

const messages = defineMessages({
  collaborator: {
    id: 'UserUtil.collaborator',
    defaultMessage: 'Collaborator',
    description: 'User type label for a user without editor or admin privileges',
  },
  editor: {
    id: 'UserUtil.editor',
    defaultMessage: 'Editor',
    description: 'User type label for a user with edit privileges',
  },
  admin: {
    id: 'UserUtil.admin',
    defaultMessage: 'Admin',
    description: 'User type label for a user with admin privileges',
  },
});

const LocalizedRole = ({ role, children }) => role ?
  <FormattedMessage {...messages[role]}>{children}</FormattedMessage>
  : null;
LocalizedRole.defaultProps = {
  children: null,
};
LocalizedRole.propTypes = {
  role: PropTypes.oneOf(Object.keys(messages)).isRequired,
  children: PropTypes.func, // or null
};

const UserUtil = {
  myRole: (currentUser, teamSlug) => {
    if (!currentUser) return null;
    const teams = safelyParseJSON(currentUser.teams);
    return teams[teamSlug] && teams[teamSlug].role;
  },
};

export default UserUtil;
export { LocalizedRole };
