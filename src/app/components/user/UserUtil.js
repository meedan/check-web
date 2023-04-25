/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages } from 'react-intl';
import { safelyParseJSON } from '../../helpers';

const messages = defineMessages({
  collaborator: {
    id: 'UserUtil.collaborator',
    defaultMessage: 'Collaborator',
  },
  editor: {
    id: 'UserUtil.editor',
    defaultMessage: 'Editor',
  },
  admin: {
    id: 'UserUtil.admin',
    defaultMessage: 'Admin',
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
