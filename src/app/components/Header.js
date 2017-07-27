import React, { Component } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import IconMoreVert from 'material-ui/svg-icons/navigation/more-vert';
import IconSearch from 'material-ui/svg-icons/action/search';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import Divider from 'material-ui/Divider';
import { FormattedMessage, injectIntl } from 'react-intl';
import { mapGlobalMessage } from './MappedMessage';
import UserMenuRelay from '../relay/UserMenuRelay';
import { logout } from '../redux/actions';
import TeamMenuRelay from '../relay/TeamMenuRelay';
import ProjectMenuRelay from '../relay/ProjectMenuRelay';
import TeamHeader from './team/TeamHeader';
import TeamPublicHeader from './team/TeamPublicHeader';
import ProjectHeader from './project/ProjectHeader';
import { stringHelper } from '../customHelpers';
import { anchorOrigin, black54, black02, units } from '../styles/js/variables';

const MenuActionsSecondary = styled.div`
  display: flex;
  align-items: center;
  & > * {
    margin-left: ${units(2)} !important;
    display: flex-item !important;
  }
`;

const TeamHeaderContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  min-width: ${units(6)};
  overflow: hidden;
`;

const HeaderAppLink = styled(Link)`
  align-items: center;
  display: flex;

  img {
    width: ${units(8)};
  }
`;

class Header extends Component {
  render() {
    const { loggedIn } = this.props;
    const path = this.props.location ? this.props.location.pathname : window.location.pathname;
    const showCheckLogo = /^\/(check(\/.*)?)?$/.test(path);
    const joinPage = /^\/([^/]+)\/join$/.test(path);

    const menuButton = (
      <IconButton className="header-actions__menu-toggle">
        <IconMoreVert color={black54} />
      </IconButton>
    );

    const yourTeamsMenuItem = (
      <MenuItem
        href="/check/teams"
        key="headerActions.userTeams"
        primaryText={<FormattedMessage id="headerActions.userTeams" defaultMessage="Your Teams" />}
      />
    );

    const editProjectMenuItem = <ProjectMenuRelay key="headerActions.projectMenu" {...this.props} />;

    const manageTeamMenuItem = <TeamMenuRelay key="headerActions.teamMenu" {...this.props} />;

    const logInMenuItem = (
      <MenuItem
        key="headerActions.logIn"
        className="header-actions__menu-item--login"
        href="/"
        primaryText={<FormattedMessage id="headerActions.signIn" defaultMessage="Sign In" />}
      />
    );

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
        href={stringHelper('CONTACT_HUMAN_URL')}
        primaryText={
          <FormattedMessage id="headerActions.contactHuman" defaultMessage="Contact a Human" />
        }
      />
    );

    const TosMenuItem = (
      <MenuItem
        key="headerActions.tos"
        href={stringHelper('TOS_URL')}
        target="_blank"
        rel="noopener noreferrer"
        primaryText={<FormattedMessage id="headerActions.tos" defaultMessage="Terms of Service" />}
      />
    );

    const privacyMenuItem = (
      <MenuItem
        key="headerActions.privacyPolicy"
        target="_blank"
        rel="noopener noreferrer"
        href={stringHelper('PP_URL')}
        primaryText={
          <FormattedMessage id="headerActions.privacyPolicy" defaultMessage="Privacy Policy" />
        }
      />
    );

    const aboutMenuItem = (
      <MenuItem
        key="headerActions.about"
        target="_blank"
        rel="noopener noreferrer"
        href={stringHelper('ABOUT_URL')}
        primaryText={
          <FormattedMessage
            id="headerActions.about"
            defaultMessage="About {appName}"
            values={{
              appName: mapGlobalMessage(this.props.intl, 'appNameHuman'),
            }}
          />
        }
      />
    );

    const secondaryMenu = (
      <IconMenu key="header.secondaryMenu" anchorOrigin={anchorOrigin} iconButtonElement={menuButton}>
        {loggedIn && yourTeamsMenuItem}
        {!joinPage && editProjectMenuItem}
        {!joinPage && manageTeamMenuItem}
        {loggedIn ? logOutMenuItem : logInMenuItem}
        <Divider />
        {contactMenuItem}
        {TosMenuItem}
        {privacyMenuItem}
        {aboutMenuItem}
      </IconMenu>
    );

    const searchButton = (
      <IconButton href={`/${this.props.params.team}/search`} name="search" key="header.searchButton" className="header-actions__search-icon">
        <IconSearch color={black54} />
      </IconButton>
    );

    const userMenu = (() => {
      if (loggedIn) {
        return <UserMenuRelay key="header.userMenu" {...this.props} />;
      }
      return (
        <RaisedButton
          key="header.userMenu.signIn"
          primary
          label={<FormattedMessage id="headerActions.signIn" defaultMessage="Sign In" />}
          href="/"
        />
      );
    })();

    const elementsRight = (() => {
      if (this.props.params && this.props.params.team) {
        return (
          <MenuActionsSecondary>
            {[searchButton, userMenu, secondaryMenu]}
          </MenuActionsSecondary>
        );
      }
      return secondaryMenu;
    })();

    const leftActions = (() => {
      if (showCheckLogo) {
        return (
          <HeaderAppLink to="/check/teams">
            <img alt="Team Logo" src={stringHelper('LOGO_URL')} />
          </HeaderAppLink>
        );
      }
      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <TeamHeaderContainer>
            {joinPage
              ? <TeamPublicHeader {...this.props} />
              : <TeamHeader {...this.props} />}
          </TeamHeaderContainer>
          <ProjectHeader {...this.props} />
        </div>
      );
    })();

    return (
      <AppBar
        style={{ backgroundColor: black02, boxShadow: 'none' }}
        iconElementLeft={leftActions}
        iconElementRight={elementsRight}
      />
    );
  }
}

export default injectIntl(Header);
