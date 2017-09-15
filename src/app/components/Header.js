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
import { appBarInnerHeight, anchorOrigin, units } from '../styles/js/variables';

const MenuActionsSecondary = styled.div`
  display: flex;
  align-items: center;
  & > * {
    margin-left: ${units(1)} !important;
    margin-right: ${units(1)} !important;
    display: flex-item !important;
  }
`;

const styles = {
  appBar: {
    boxShadow: 'none',
  },
  elementsPrimary: {
    display: 'flex',
    alignItems: 'center',
    height: appBarInnerHeight,
  },
  teamHeader: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    minWidth: units(6),
    overflow: 'hidden',
    margin: `0 ${units(1)}`,
  },
};

class Header extends Component {

  render() {
    const { loggedIn } = this.props;
    const path = this.props.location ? this.props.location.pathname : window.location.pathname;
    const showCheckLogo = /^\/(check(\/.*)?)?$/.test(path);
    const joinPage = /^\/([^/]+)\/join$/.test(path);


    const menuButton = (
      <IconButton className="header-actions__menu-toggle">
        <IconMoreVert />
      </IconButton>
    );

    const yourTeamsMenuItem = (
      <MenuItem
        containerElement={<Link to="/check/teams" />}
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
          <FormattedMessage id="headerActions.contactHuman" defaultMessage="Contact a Human" />
        }
      />
    );

    const TosMenuItem = (
      <MenuItem
        key="headerActions.tos"
        containerElement={<Link to={stringHelper('TOS_URL')} />}
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
        containerElement={<Link to={stringHelper('PP_URL')} />}
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
        containerElement={<Link to={`/${this.props.params.team}/search`} />}
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
          containerElement={<Link to="/" />}
        />
      );
    })();

    const elementsSecondary = (() => {
      if (this.props.params && this.props.params.team) {
        return (
          <MenuActionsSecondary>
            {[searchButton, userMenu, secondaryMenu]}
          </MenuActionsSecondary>
        );
      }
      return (
        <MenuActionsSecondary>
          {[userMenu, secondaryMenu]}
        </MenuActionsSecondary>
      );
    })();

    const elementsTitle = (() => {
      if (showCheckLogo) {
        return null;
      }
      return (
        <div style={styles.elementsPrimary}>
          <ProjectHeader {...this.props} />
        </div>
      );
    })();

    const elementsPrimary = (() => {
      if (!showCheckLogo) {
        return (
          <div style={styles.teamHeader}>
            {joinPage
              ? <TeamPublicHeader {...this.props} />
              : <TeamHeader {...this.props} />}
          </div>
        );
      } return (
        <div style={styles.elementsPrimary}>
          <Link style={styles.elementsPrimary} to="/check/teams">
            <img width={units(8)} alt="Team Logo" src={stringHelper('LOGO_URL')} />
          </Link>
        </div>
      );
    })();

    return (
      <AppBar
        style={styles.appBar}
        title={elementsTitle}
        iconElementLeft={elementsPrimary}
        iconElementRight={elementsSecondary}
      />
    );
  }
}

export default injectIntl(Header);
