import React from 'react';
import MenuItem from 'material-ui/MenuItem';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import Divider from 'material-ui/Divider';
import { logout } from '../redux/actions';
import { stringHelper } from '../customHelpers';

const UserMenuItems = (props) => {
  const logOutMenuItem = (
    <MenuItem
      key="headerActions.logOut"
      className="header-actions__menu-item--logout"
      onClick={logout}
      primaryText={<FormattedMessage id="headerActions.signOut" defaultMessage="Sign Out" />}
    />
  );

  const contactMenuItem = (
    <MenuItem
      key="headerActions.contactHuman"
      target="_blank"
      rel="noopener noreferrer"
      containerElement={<Link to={stringHelper('CONTACT_HUMAN_URL')} />} // eslint-disable-line jsx-a11y/anchor-has-content
      primaryText={
        <FormattedMessage
          id="headerActions.contactHuman"
          defaultMessage="Contact a Human"
        />
      }
    />
  );

  return (
    <div>
      <Divider />
      { props.loggedIn ? logOutMenuItem : null }
      { props.hideContactMenuItem ? null : contactMenuItem }
    </div>
  );
};

export default UserMenuItems;
