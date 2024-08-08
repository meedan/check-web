import { safelyParseJSON } from '../../helpers';

const UserUtil = {
  myRole: (currentUser, teamSlug) => {
    if (!currentUser) return null;

    if (currentUser.is_admin) return 'admin';

    const teams = safelyParseJSON(currentUser.teams);
    return teams[teamSlug] && teams[teamSlug].role;
  },
};

export default UserUtil;
