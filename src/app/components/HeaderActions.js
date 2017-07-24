import React, { Component } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import MdSearch from 'react-icons/lib/md/search';
import MdMoreVert from 'react-icons/lib/md/more-vert';
import IconButton from 'material-ui/IconButton';
import SvgIcon from 'material-ui/SvgIcon';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import { mapGlobalMessage } from './MappedMessage';
import UserMenuRelay from '../relay/UserMenuRelay';
import { logout } from '../redux/actions';
import TeamMenuRelay from '../relay/TeamMenuRelay';
import ProjectMenuRelay from '../relay/ProjectMenuRelay';
import { stringHelper } from '../customHelpers';
import { black54 } from '../styles/js/variables';

const styles = {
  iconButton: {
    fontSize: '24px',
  },
};

const menuButton = (
  <IconButton className="header-actions__menu-toggle" style={styles.iconButton}>
    <SvgIcon style={styles.svgIcon}>
      <MdMoreVert color={black54} />
    </SvgIcon>
  </IconButton>
);

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

class HeaderActions extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isMenuOpen: false,
    };
  }

  render() {
    const path = window.location.pathname;
    const joinPage = /^\/([^/]+)\/join$/.test(path);
    const loggedIn = this.props.loggedIn;

    return (
      <div>
        {(() => {
          if (this.props.params && this.props.params.team) {
            return searchButton(this.props.params.team);
          }
        })()}

        <IconMenu
          iconButtonElement={menuButton}
          anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
          targetOrigin={{ horizontal: 'left', vertical: 'top' }}
        >

          {loggedIn
            ? <MenuItem key="headerActions.userMenu">
              <UserMenuRelay {...this.props} />
            </MenuItem>
            : null}

          {loggedIn
            ? <MenuItem
              href="/check/teams"
              key="headerActions.userTeams"
              primaryText={
                <FormattedMessage id="headerActions.userTeams" defaultMessage="Your Teams" />
              }
            />
            : null}

          {(() => {
            if (!joinPage) {
              return [
                <ProjectMenuRelay key="headerActions.projectMenu" {...this.props} />,
                <TeamMenuRelay key="headerActions.teamMenu" {...this.props} />,
              ];
            }
          })()}

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
        </IconMenu>
      </div>
    );
  }
}

export default injectIntl(HeaderActions);
