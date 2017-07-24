import React, { Component } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import SvgIcon from 'material-ui/SvgIcon';
import MdMoreVert from 'react-icons/lib/md/more-vert';
import MdSearch from 'react-icons/lib/md/search';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import { FormattedMessage, injectIntl } from 'react-intl';
import { mapGlobalMessage } from './MappedMessage';
import UserMenuRelay from '../relay/UserMenuRelay';
import { logout } from '../redux/actions';
import TeamMenuRelay from '../relay/TeamMenuRelay';
import ProjectMenuRelay from '../relay/ProjectMenuRelay';
import TeamHeader from './team/TeamHeader';
import ProjectHeader from './project/ProjectHeader';
import { stringHelper } from '../customHelpers';
import { black54, black02, units, headerHeight } from '../styles/js/variables';

const styles = {
  iconButton: {
    fontSize: '24px',
  },
  rightActions: {
    display: 'flex',
    alignItems: 'center',
  },
};

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
    const joinPage = /^\/([^/]+)\/join$/.test(window.location.pathname);

    const { loggedIn } = this.props;

    const menuButton = (
      <IconButton className="header-actions__menu-toggle" style={styles.iconButton}>
        <SvgIcon style={styles.svgIcon}>
          <MdMoreVert color={black54} />
        </SvgIcon>
      </IconButton>
    );

    const secondaryMenu =
        (<IconMenu
          iconButtonElement={menuButton}
          anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
          targetOrigin={{ horizontal: 'left', vertical: 'top' }}
        >
          {loggedIn
            ? <MenuItem
              href="/check/teams"
              key="headerActions.userTeams"
              primaryText={
                <FormattedMessage id="headerActions.userTeams" defaultMessage="Your Teams" />
              }
            />
            : null}

          {!joinPage
            ?
          [
            <ProjectMenuRelay key="headerActions.projectMenu" {...this.props} />,
            <TeamMenuRelay key="headerActions.teamMenu" {...this.props} />,
          ]
            : null }

          {loggedIn
            ? <MenuItem
              key="headerActions.signIn"
              className="header-actions__menu-item--logout"
              onClick={logout}
              primaryText={
                <FormattedMessage id="headerActions.signOut" defaultMessage="Sign Out" />
              }
            />
            : <MenuItem
              className="header-actions__menu-item--login"
              href="/"
              primaryText={
                <FormattedMessage id="headerActions.signIn" defaultMessage="Sign In" />
              }
            />}

          <Divider />

          <MenuItem
            key="headerActions.contactHuman"
            target="_blank"
            rel="noopener noreferrer"
            href={stringHelper('CONTACT_HUMAN_URL')}
            primaryText={
              <FormattedMessage id="headerActions.contactHuman" defaultMessage="Contact a Human" />
            }
          />

          <MenuItem
            key="headerActions.tos"
            href={stringHelper('TOS_URL')}
            target="_blank"
            rel="noopener noreferrer"
            primaryText={
              <FormattedMessage id="headerActions.tos" defaultMessage="Terms of Service" />
            }
          />

          <MenuItem
            key="headerActions.privacyPolicy"
            target="_blank"
            rel="noopener noreferrer"
            href={stringHelper('PP_URL')}
            primaryText={<FormattedMessage id="headerActions.privacyPolicy" defaultMessage="Privacy Policy" />}
          />

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
        </IconMenu>);

    const searchButton = team =>
      <IconButton
        href={`/${team}/search`}
        name="search"
        className="header-actions__search-icon"
        style={styles.iconButton}
      >
        <SvgIcon>
          <MdSearch color={black54} />
        </SvgIcon>
      </IconButton>;

    const userMenu = (() => {
      if (loggedIn) {
        return (<MenuItem key="headerActions.userMenu">
          <UserMenuRelay {...this.props} />
        </MenuItem>);
      }
      return 'Sign In';
    })();

    const rightActions = (() => {
      if (this.props.params && this.props.params.team) {
        return <div style={styles.rightActions}>{[searchButton(this.props.params.team), userMenu, secondaryMenu]}</div>;
      }
      return secondaryMenu;
    })();

    const path = this.props.location
      ? this.props.location.pathname
      : window.location.pathname;

    const showCheckLogo = /^\/(check(\/.*)?)?$/.test(path);

    const leftActions = (() => {
      if (showCheckLogo) {
        return (<HeaderAppLink to="/check/teams">
          <img alt="Team Logo" src={stringHelper('LOGO_URL')} />
        </HeaderAppLink>);
      }
      return (<TeamHeaderContainer> <TeamHeader {...this.props} /> </TeamHeaderContainer>);
    })();

    return (
      <AppBar
        iconElementLeft={leftActions}
        title={<ProjectHeader {...this.props} />}
        iconElementRight={rightActions}
      />
    );
  }
}

export default injectIntl(Header);
