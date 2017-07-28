import React, { Component } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router';
import IconButton from 'material-ui/IconButton';
import IconMoreVert from 'material-ui/svg-icons/navigation/more-vert';
import IconSearch from 'material-ui/svg-icons/action/search';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import Divider from 'material-ui/Divider';
import { FormattedMessage, injectIntl } from 'react-intl';
import rtlDetect from 'rtl-detect';
import { mapGlobalMessage } from './MappedMessage';
import UserMenuRelay from '../relay/UserMenuRelay';
import { logout } from '../redux/actions';
import TeamMenuRelay from '../relay/TeamMenuRelay';
import ProjectMenuRelay from '../relay/ProjectMenuRelay';
import TeamHeader from './team/TeamHeader';
import TeamPublicHeader from './team/TeamPublicHeader';
import ProjectHeader from './project/ProjectHeader';
import { stringHelper } from '../customHelpers';
import { appBarInnerHeight, black02, anchorOrigin, units } from '../styles/js/variables';


class Header extends Component {

  render() {
    const { loggedIn } = this.props;
    const path = this.props.location ? this.props.location.pathname : window.location.pathname;
    const showCheckLogo = /^\/(check(\/.*)?)?$/.test(path);
    const joinPage = /^\/([^/]+)\/join$/.test(path);
    const locale = this.props.intl.locale;
    const isRtl = rtlDetect.isRtlLang(locale);
    const fromDirection = isRtl ? 'right' : 'left';
    const toDirection = isRtl ? 'left' : 'right';

    const HeaderBar = styled.div`
      background-color: ${black02};
      display: flex;
      align-items: center;
    `;

    const elementsPrimary = styled.div`
      border: 1px solid pink;
      display: flex;
      align-items: center;
    `;

    const elementsSecondary = styled.div`
      border: 1px solid green;
      display: flex;
      align-items: center;
      margin-${fromDirection}: auto;
    `;

    const menuButton = (
      <IconButton className="header-actions__menu-toggle">
        <IconMoreVert />
      </IconButton>
    );

    const yourTeamsMenuItem = (
      <MenuItem
        href="/check/teams"
        key="headerActions.userTeams"
        primaryText={<FormattedMessage id="headerActions.userTeams" defaultMessage="Your Teams" />}
      />
    );

    const editProjectMenuItem = (
      <ProjectMenuRelay key="headerActions.projectMenu" {...this.props} />
    );

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
      <IconMenu
        key="header.secondaryMenu"
        anchorOrigin={anchorOrigin}
        iconButtonElement={menuButton}
      >
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
      <IconButton
        href={`/${this.props.params.team}/search`}
        name="search"
        key="header.searchButton"
        className="header-actions__search-icon"
      >
        <IconSearch />
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

    const Secondary = (() => {
      if (this.props.params && this.props.params.team) {
        return (
          <elementsSecondary>
            {[searchButton, userMenu, secondaryMenu]}
          </elementsSecondary>
        );
      }
      return (
        <elementsSecondary>
          {[userMenu, secondaryMenu]}
        </elementsSecondary>
      );
    })();

    const Primary = (
      <elementsPrimary>
        { joinPage
          ? <TeamPublicHeader {...this.props} />
          : <TeamHeader {...this.props} />}
        { showCheckLogo
          ? <Link to="/check/teams">
            <img width={units(8)} alt="Team Logo" src={stringHelper('LOGO_URL')} />
          </Link>
          : <div> <ProjectHeader {...this.props} /> </div>
        }
      </elementsPrimary>
    );

    return (
      <HeaderBar>
        {Primary}
        {Secondary}
      </HeaderBar>
    );
  }
}

export default injectIntl(Header);
