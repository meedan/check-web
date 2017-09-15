import React, { Component } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router';
import IconButton from 'material-ui/IconButton';
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
import {
  defaultAnchorOrigin,
  units,
  mediaQuery,
  headerHeight,
  headerOffset,
  Row,
  black02,
} from '../styles/js/variables';

const HeaderBar = styled.div`
  background-color: ${black02};
  display: flex;
  align-items: center;
  padding: 0 ${units(2)};
  z-index: 2;
  height: ${headerHeight};
  overflow: hidden;
  ${mediaQuery.handheld`
    padding: 0 ${units(1)};
  `}
`;

class Header extends Component {
  render() {
    const locale = this.props.intl.locale;
    const isRtl = rtlDetect.isRtlLang(locale);
    const fromDirection = isRtl ? 'right' : 'left';
    const hasTeam = this.props.params && this.props.params.team;
    const { loggedIn } = this.props;
    const path = this.props.location
      ? this.props.location.pathname
      : window.location.pathname;
    const showCheckLogo = /^\/(check(\/.*)?)?$/.test(path);
    const joinPage = /^\/([^/]+)\/join$/.test(path);

    const AlignOpposite = styled.div`
      margin-${fromDirection}: auto;
      `;

    const Offset = styled.div`
      padding: 0 ${headerOffset} !important;
    `;

    const yourTeamsMenuItem = (
      <MenuItem
        containerElement={<Link to="/check/teams" />}
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
        containerElement={<Link to="/" />}
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
        containerElement={<Link to={stringHelper('CONTACT_HUMAN_URL')} />}
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
        containerElement={<Link to={stringHelper('TOS_URL')} />}
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
        containerElement={<Link to={stringHelper('PP_URL')} />}
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
        containerElement={<Link to={stringHelper('ABOUT_URL')} />}
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

    const userMenuButton = (() => {
      if (loggedIn) {
        return (
          <IconButton key="header.userMenu" style={{ width: 56, height: 56 }}>
            <UserMenuRelay {...this.props} />
          </IconButton>
        );
      }
      return (
        <Offset key="header.userMenu.signIn">
          <Link to="/">
            <RaisedButton
              primary
              label={
                <FormattedMessage
                  defaultMessage="Sign In"
                  id="headerActions.signIn"
                />
              }
            />
          </Link>
        </Offset>
      );
    })();

    const userMenu = (
      <IconMenu
        key="header.userMenu"
        anchorOrigin={defaultAnchorOrigin}
        iconButtonElement={userMenuButton}
        className="header-actions__menu-toggle"
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
          containerElement={<Link to={`/${this.props.params.team}/search`} />}
          name="search"
        >
          <IconSearch />
        </IconButton>
      </Offset>
    );

    const teamAndProjectHeader = (
      <Row containsEllipsis>
        <Offset>
          <TeamHeader {...this.props} />
        </Offset>
        <Offset>
          <ProjectHeader {...this.props} />
        </Offset>
      </Row>
    );

    const checkLogo = (
      <Link to="/check/teams">
        <img
          width={units(8)}
          alt="Team Logo"
          src={stringHelper('LOGO_URL')}
        />
      </Link>
    );

    const primary = (() => {
      if (showCheckLogo) {
        return checkLogo;
      }
      if (joinPage) {
        return (
          <Row containsEllipsis>
            <TeamPublicHeader {...this.props} />
          </Row>
        );
      }
      return (
        <Row containsEllipsis>
          {teamAndProjectHeader}
        </Row>
      );
    })();

    const secondary = (() => {
      if (hasTeam) {
        return (
          <AlignOpposite>
            <Row>
              {[
                searchButton,
                userMenu,
              ]}
            </Row>
          </AlignOpposite>
        );
      }
      return (
        <AlignOpposite>
          {userMenu}
        </AlignOpposite>
      );
    })();

    return (
      <HeaderBar>
        {primary}
        {secondary}
      </HeaderBar>
    );
  }
}

export default injectIntl(Header);
