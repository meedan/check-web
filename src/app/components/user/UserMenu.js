import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
import UserUtil from './UserUtil';
import UserMenuItems from '../UserMenuItems';
import UserAvatarRelay from '../../relay/UserAvatarRelay';
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

class UserMenu extends React.Component {
  render() {
    const { loggedIn, user } = this.props;

    const userRoleText = <span style={{ color: black54 }}>
      {`(${UserUtil.userRole(user, user.current_team)})`}
    </span>;

    return loggedIn ? (
      <IconMenu
        className="header__user-menu"
        iconButtonElement={
          <IconButton
            style={styles.UserMenuStyle}
            >
            <UserAvatarRelay size={units(4)} {...this.props} />
          </IconButton>
        }
        anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
        >
        <MenuItem
          containerElement={<Link to={`/check/me`} />}
          secondaryText={userRoleText}
          >
          {user && user.name}
        </MenuItem>
        <MenuItem
          containerElement={<Link to={`/check/me`} />}
          >
          <FormattedMessage id="userMenu.Profile" defaultMessage="Profile" />
        </MenuItem>
        <UserMenuItems {...this.props} />
      </IconMenu>
    ) : null;
  }
}

export default UserMenu;
