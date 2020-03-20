import React from 'react';
import { Link } from 'react-router';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import ExternalLink from './ExternalLink';
import { logout } from '../redux/actions';
import { opaqueBlack87 } from '../styles/js/shared';

const StyledUserMenuItems = styled.div`
  a:link, a:visited, a:hover, a:active {
    color: ${opaqueBlack87};
    text-decoration: none;
  }
`;

const UserMenuItems = () => (
  <StyledUserMenuItems>
    <Link to="/check/me">
      <MenuItem className="user-menu__user-settings">
        <ListItemText
          primary={
            <FormattedMessage id="UserMenu.userSettings" defaultMessage="User settings" />
          }
        />
      </MenuItem>
    </Link>

    <ExternalLink url="https://help.checkmedia.org/">
      <MenuItem className="user-menu__training">
        <ListItemText
          primary={
            <FormattedMessage id="UserMenu.training" defaultMessage="Training and documentation" />
          }
        />
      </MenuItem>
    </ExternalLink>

    <ExternalLink url="https://meedan.com/en/check/check_tos.html">
      <MenuItem className="user-menu__tos">
        <FormattedMessage id="UserMenu.tos" defaultMessage="Terms of service" />
      </MenuItem>
    </ExternalLink>

    <ExternalLink url="https://meedan.com/en/check/check_privacy.html">
      <MenuItem className="user-menu__pp">
        <ListItemText
          primary={
            <FormattedMessage id="UserMenu.pp" defaultMessage="Privacy policy" />
          }
        />
      </MenuItem>
    </ExternalLink>

    <ExternalLink url="https://meedan.com/en/check/">
      <MenuItem className="user-menu__about">
        <ListItemText
          primary={<FormattedMessage id="UserMenu.about" defaultMessage="About" />}
        />
      </MenuItem>
    </ExternalLink>

    <MenuItem className="user-menu__logout" onClick={logout}>
      <ListItemText
        primary={<FormattedMessage id="UserMenu.signOut" defaultMessage="Sign Out" />}
      />
    </MenuItem>
  </StyledUserMenuItems>
);

export default UserMenuItems;
