import React from 'react';
import MenuItem from 'material-ui/MenuItem';
import { FormattedMessage } from 'react-intl';
import Divider from 'material-ui/Divider';
import { logout } from '../redux/actions';

const UserMenuItems = (props) => {
  const logOutMenuItem = (
    <MenuItem
      key="headerActions.logOut"
      className="header-actions__menu-item--logout"
      onClick={logout}
      primaryText={<FormattedMessage id="headerActions.signOut" defaultMessage="Sign Out" />}
    />
  );

  return (
    <div>
      <Divider />
      { props.loggedIn && logOutMenuItem }
    </div>
  );
};

export default UserMenuItems;
