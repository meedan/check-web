import React, { Component, PropTypes } from 'react';
import UserMenuRelay from '../relay/UserMenuRelay';
import { logout } from '../redux/actions';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import MappedMessage, { mapGlobalMessage } from './MappedMessage';
import MdSearch from 'react-icons/lib/md/search';
import MdMoreVert from 'react-icons/lib/md/more-vert';
import IconButton from 'material-ui/IconButton';
import TeamMenuRelay from '../relay/TeamMenuRelay';
import ProjectMenuRelay from '../relay/ProjectMenuRelay';
import { bemClass } from '../helpers';
import { stringHelper } from '../customHelpers';
import { Link } from 'react-router';
import config from 'config';
import { black54, units } from '../styles/js/variables';
import SvgIcon from 'material-ui/SvgIcon';

const styles = {
  iconButton: {
    fontSize: '24px',
  },
};

class HeaderActions extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isMenuOpen: false,
    };
  }

  toggleSettingsMenu() {
    this.setState({ isMenuOpen: !this.state.isMenuOpen });
  }

  render() {
    const appName = config.appName;
    const path = window.location.pathname;
    const joinPage = /^\/([^\/]+)\/join$/.test(path);
    const loggedIn = this.props.loggedIn;

    return (
      <div
        className={bemClass(
          'header-actions',
          this.state.isMenuOpen,
          '--active',
        )}
      >
        {(() => {
          if (this.props.params && this.props.params.team) {
            return (
              <IconButton
                href={`/${this.props.params.team}/search`}
                name="search"
                className="header-actions__search-icon"
                style={styles.iconButton}
              >
                <SvgIcon>
                  <MdSearch color={black54} />
                </SvgIcon>
              </IconButton>
            );
          }
        })()}

        <IconButton
          onClick={this.toggleSettingsMenu.bind(this)}
          className="header-actions__menu-toggle"
          style={styles.iconButton}
        >
          <SvgIcon style={styles.svgIcon}>
            <MdMoreVert color={black54} />
          </SvgIcon>
        </IconButton>

        <div
          className={bemClass(
            'header-actions__menu-overlay',
            this.state.isMenuOpen,
            '--active',
          )}
          onClick={this.toggleSettingsMenu.bind(this)}
        />
        <ul
          className={bemClass(
            'header-actions__menu',
            this.state.isMenuOpen,
            '--active',
          )}
        >
          {loggedIn
            ? <li
              key="headerActions.userMenu"
              className="header-actions__menu-item"
              style={{ cursor: 'default' }}
            >
              <UserMenuRelay {...this.props} />
            </li>
            : null}
          {loggedIn
            ? <li
              key="headerActions.userTeams"
              className="header-actions__menu-item"
            >
              <Link to="/check/teams">
                <FormattedMessage
                  id="headerActions.userTeams"
                  defaultMessage="Your Teams"
                />
              </Link>
            </li>
            : null}
          {(() => {
            if (!joinPage) {
              return [
                <ProjectMenuRelay
                  key="headerActions.projectMenu"
                  {...this.props}
                />,
                <TeamMenuRelay key="headerActions.teamMenu" {...this.props} />,
              ];
            }
          })()}
          {loggedIn
            ? <li
              key="headerActions.signIn"
              className="header-actions__menu-item header-actions__menu-item--logout"
              onClick={logout}
            >
              <FormattedMessage
                id="headerActions.signOut"
                defaultMessage="Sign Out"
              />
            </li>
            : <li className="header-actions__menu-item header-actions__menu-item--login">
              <Link to="/">
                <FormattedMessage
                  id="headerActions.signIn"
                  defaultMessage="Sign In"
                />
              </Link>
            </li>}
          <li
            key="headerActions.contactHuman"
            className="header-actions__menu-item"
          >
            <a
              className="header-actions__link"
              target="_blank"
              rel="noopener noreferrer"
              href={stringHelper('CONTACT_HUMAN_URL')}
            >
              <FormattedMessage
                id="headerActions.contactHuman"
                defaultMessage="Contact a Human"
              />
            </a>
          </li>
          <li key="headerActions.tos" className="header-actions__menu-item">
            <a
              className="header-actions__link"
              target="_blank"
              rel="noopener noreferrer"
              href={stringHelper('TOS_URL')}
            >
              <FormattedMessage
                id="headerActions.tos"
                defaultMessage="Terms of Service"
              />
            </a>
          </li>
          <li
            key="headerActions.privacyPolicy"
            className="header-actions__menu-item"
          >
            <a
              className="header-actions__link"
              target="_blank"
              rel="noopener noreferrer"
              href={stringHelper('PP_URL')}
            >
              <FormattedMessage
                id="headerActions.privacyPolicy"
                defaultMessage="Privacy Policy"
              />
            </a>
          </li>
          <li key="headerActions.about" className="header-actions__menu-item">
            <a
              className="header-actions__link"
              target="_blank"
              rel="noopener noreferrer"
              href={stringHelper('ABOUT_URL')}
            >
              <FormattedMessage
                id="headerActions.about"
                defaultMessage="About {appName}"
                values={{
                  appName: mapGlobalMessage(this.props.intl, 'appNameHuman'),
                }}
              />
            </a>
          </li>
        </ul>
      </div>
    );
  }
}

export default injectIntl(HeaderActions);
