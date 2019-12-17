import React from 'react';
import { Link } from 'react-router';
import MenuItem from 'material-ui/MenuItem';
import { FormattedMessage } from 'react-intl';
import ExternalLink from './ExternalLink';
import { logout } from '../redux/actions';

const UserMenuItems = () => (
  <div>
    <MenuItem
      className="user-menu__user-settings"
      containerElement={<Link to="/check/me" />}
      primaryText={<FormattedMessage id="UserMenu.userSettings" defaultMessage="User settings" />}
    />
    <MenuItem
      className="user-menu__training"
      primaryText={
        <ExternalLink url="https://intercom.help/meedan/en/">
          <FormattedMessage id="UserMenu.training" defaultMessage="Training and documentation" />
        </ExternalLink>
      }
    />
    <MenuItem
      className="user-menu__tos"
      primaryText={
        <ExternalLink url="https://meedan.com/en/check/check_tos.html">
          <FormattedMessage id="UserMenu.tos" defaultMessage="Terms of service" />
        </ExternalLink>
      }
    />
    <MenuItem
      className="user-menu__pp"
      primaryText={
        <ExternalLink url="https://meedan.com/en/check/check_privacy.html">
          <FormattedMessage id="UserMenu.pp" defaultMessage="Privacy policy" />
        </ExternalLink>
      }
    />
    <MenuItem
      className="user-menu__about"
      primaryText={
        <ExternalLink url="https://meedan.com/en/check/">
          <FormattedMessage id="UserMenu.about" defaultMessage="About" />
        </ExternalLink>
      }
    />
    <MenuItem
      className="user-menu__logout"
      onClick={logout}
      primaryText={<FormattedMessage id="UserMenu.signOut" defaultMessage="Sign Out" />}
    />
  </div>
);

export default UserMenuItems;
