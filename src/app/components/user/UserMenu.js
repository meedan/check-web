import React from 'react';
import { injectIntl } from 'react-intl';
import { Link } from 'react-router';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
import UserUtil from './UserUtil';
import UserMenuItems from '../UserMenuItems';
import UserAvatar from '../UserAvatar';
import {
  black54,
  units,
} from '../../styles/js/shared';

const styles = {
  UserMenuStyle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: units(4),
    height: units(4),
    padding: 0,
    margin: `0 ${units(1)}`,
  },
};

const UserMenu = (props) => {
  const { currentUserIsMember, inTeamContext, loggedIn, user, team } = props;

  if (!loggedIn) {
    return null;
  }

  const role = inTeamContext && currentUserIsMember && UserUtil.userRole(user, team);
  const localizedRoleText = role &&
    <span className="user-menu__role" style={{ color: black54 }}>
      {`(${UserUtil.localizedRole(role, props.intl)})`}
    </span>;

  return (
    <IconMenu
      className="header__user-menu"
      iconButtonElement={
        <IconButton style={styles.UserMenuStyle}>
          <UserAvatar size={units(4)} {...props} />
        </IconButton>
      }
      anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
    >
      <MenuItem
        containerElement={<Link to={'/check/me'} />}
        secondaryText={localizedRoleText}
      >
        {user && user.name}
      </MenuItem>
      <UserMenuItems {...props} />
    </IconMenu>
  );
};

UserMenu.contextTypes = {
  store: React.PropTypes.object,
};

export default injectIntl(UserMenu);
