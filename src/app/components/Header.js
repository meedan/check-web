import React, { Component } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router';
import IconMoreVert from 'material-ui/svg-icons/navigation/more-vert';
import IconSearch from 'material-ui/svg-icons/action/search';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import Divider from 'material-ui/Divider';
import IconArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import IconButton from 'material-ui/IconButton';
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
import {
  black02,
  defaultAnchorOrigin,
  units,
  headerOffset,
  headerHeight,
  Row,
  mediaQuery,
} from '../styles/js/variables';

class Header extends Component {
  render() {
    const { loggedIn } = this.props;
    const path = this.props.location
      ? this.props.location.pathname
      : window.location.pathname;
    const showCheckLogo = /^\/(check(\/.*)?)?$/.test(path);
    const joinPage = /^\/([^/]+)\/join$/.test(path);
    const locale = this.props.intl.locale;
    const isRtl = rtlDetect.isRtlLang(locale);
    const fromDirection = isRtl ? 'right' : 'left';
    const hasTeam = this.props.params && this.props.params.team;
    const regexProject = /(.*\/project\/[0-9]+)/;
    const regexMedia = /\/media\/[0-9]/;
    const backUrl = (regexMedia.test(path)) ? path.match(regexProject)[1] : null;
    const isProjectSubpage = regexMedia.test(path);

    const HeaderBar = styled.div`
      background-color: ${black02};
      display: flex;
      align-items: center;
      padding: 0 ${units(2)};
      z-index: 2;
      overflow: hidden;
      height: ${headerHeight};
      ${mediaQuery.handheld`
        padding: 0 ${units(1)};
      `}
    `;

    const AlignOpposite = styled.div`
      margin-${fromDirection}: auto;
    `;

    const Offset = styled.div`
      padding: 0 ${headerOffset} !important;
    `;

    const yourTeamsMenuItem = (
      <MenuItem
        href="/check/teams"
        key="headerActions.userTeams"
        primaryText={
          <FormattedMessage
            id="headerActions.userTeams"
            defaultMessage="Your Teams"
          />
        }
      />
    );

    const editProjectMenuItem = (
      <ProjectMenuRelay key="headerActions.projectMenu" {...this.props} />
    );

    const manageTeamMenuItem = (
      <TeamMenuRelay key="headerActions.teamMenu" {...this.props} />
    );

    const logInMenuItem = (
      <MenuItem
        key="headerActions.logIn"
        className="header-actions__menu-item--login"
        href="/"
        primaryText={
          <FormattedMessage
            id="headerActions.signIn"
            defaultMessage="Sign In"
          />
        }
      />
    );

    const logOutMenuItem = (
      <MenuItem
        key="headerActions.logOut"
        className="header-actions__menu-item--logout"
        onClick={logout}
        primaryText={
          <FormattedMessage
            id="headerActions.signOut"
            defaultMessage="Sign Out"
          />
        }
      />
    );

    const contactMenuItem = (
      <MenuItem
        key="headerActions.contactHuman"
        target="_blank"
        rel="noopener noreferrer"
        href={stringHelper('CONTACT_HUMAN_URL')}
        primaryText={
          <FormattedMessage
            id="headerActions.contactHuman"
            defaultMessage="Contact a Human"
          />
        }
      />
    );

    const TosMenuItem = (
      <MenuItem
        key="headerActions.tos"
        href={stringHelper('TOS_URL')}
        target="_blank"
        rel="noopener noreferrer"
        primaryText={
          <FormattedMessage
            id="headerActions.tos"
            defaultMessage="Terms of Service"
          />
        }
      />
    );

    const privacyMenuItem = (
      <MenuItem
        key="headerActions.privacyPolicy"
        target="_blank"
        rel="noopener noreferrer"
        href={stringHelper('PP_URL')}
        primaryText={
          <FormattedMessage
            id="headerActions.privacyPolicy"
            defaultMessage="Privacy Policy"
          />
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

    const dotMenuButton = (
      <IconButton className="header-actions__menu-toggle">
        <IconMoreVert />
      </IconButton>
    );

    const dotMenu = (
      <IconMenu
        key="header.dotMenu"
        anchorOrigin={defaultAnchorOrigin}
        iconButtonElement={dotMenuButton}
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
      <Offset key="header.searchButton">
        <IconButton
          className="header-actions__search-icon"
          href={`/${this.props.params.team}/search`}
          name="search"
        >
          <IconSearch />
        </IconButton>
      </Offset>
    );

    const userMenu = (() => {
      if (loggedIn) {
        return (
          <Offset key="header.userMenu">
            <UserMenuRelay {...this.props} />
          </Offset>
        );
      }
      return (
        <Offset key="header.userMenu.signIn">
          <RaisedButton
            primary
            href="/"
            label={
              <FormattedMessage
                defaultMessage="Sign In"
                id="headerActions.signIn"
              />
            }
          />
        </Offset>
      );
    })();

    const Primary = (() => {
      if (showCheckLogo) {
        return (<Link to="/check/teams">
          <img
            width={units(8)}
            alt="Team Logo"
            src={stringHelper('LOGO_URL')}
          />
        </Link>);
      }
      return (
        <Row>
          {joinPage
            ? <Offset><TeamPublicHeader {...this.props} /></Offset>
            : <Offset><TeamHeader {...this.props} /></Offset>}
          {isProjectSubpage
            ? <IconButton className="project-header__back-button" href={backUrl}><IconArrowBack /></IconButton>
            : null}
          <ProjectHeader {...this.props} />
        </Row>
      );
    })();

    const Secondary = (() => {
      if (hasTeam) {
        return (
          <AlignOpposite>
            <Row>
              {[
                searchButton,
                userMenu,
                dotMenu,
              ]}
            </Row>
          </AlignOpposite>
        );
      }
      return (
        <AlignOpposite>
          <Row>
            {[
              userMenu,
              dotMenu,
            ]}
          </Row>
        </AlignOpposite>
      );
    })();

    return (
      <HeaderBar>
        {Primary}
        {Secondary}
      </HeaderBar>
    );
  }
}

export default injectIntl(Header);
