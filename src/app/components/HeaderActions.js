import React, { Component, PropTypes } from 'react';
import UserMenuRelay from '../relay/UserMenuRelay';
import { logout } from '../actions/actions';
import FontAwesome from 'react-fontawesome';
import { FormattedMessage } from 'react-intl';
import TeamMenuRelay from '../relay/TeamMenuRelay';
import ProjectMenuRelay from '../relay/ProjectMenuRelay';
import { bemClass } from '../helpers';
import { Link } from 'react-router';

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

  contactHuman() {
    window.location.href = 'mailto:check@meedan.com?subject=Support Request for Check';
  }

  render() {
    return (
      <div className={bemClass('header-actions', this.state.isMenuOpen, '--active')}>
        {(() => {
          if (this.props.params && this.props.params.team) {
            return (<Link to={`/${this.props.params.team}/search`}><FontAwesome name="search" className="header-actions__search-icon" /></Link>);
          }
        })()}
        <FontAwesome name="ellipsis-h" className="header-actions__menu-toggle" onClick={this.toggleSettingsMenu.bind(this)} />
        <div className={bemClass('header-actions__menu-overlay', this.state.isMenuOpen, '--active')} onClick={this.toggleSettingsMenu.bind(this)} />
        <ul className={bemClass('header-actions__menu', this.state.isMenuOpen, '--active')}>
          <li className="header-actions__menu-item" style={{ cursor: 'default' }}><UserMenuRelay {...this.props} /></li>
          <ProjectMenuRelay {...this.props} />
          <TeamMenuRelay {...this.props} />
          <li className="header-actions__menu-item" onClick={this.contactHuman.bind(this)}>
            <FormattedMessage id="headerActions.contactHuman" defaultMessage="Contact a Human" />
          </li>
          <li className="header-actions__menu-item header-actions__menu-item--logout" onClick={logout}>
            <FormattedMessage id="headerActions.signOut" defaultMessage="Sign Out" />
          </li>
          <li className="header-actions__menu-item">
            <Link className="header-actions__link" to="/check/tos"><FormattedMessage id="headerActions.tos" defaultMessage="Terms of Service" /></Link>
          </li>
          <li className="header-actions__menu-item">
            <Link className="header-actions__link" to="/check/privacy"><FormattedMessage id="headerActions.privacyPolicy" defaultMessage="Privacy Policy" /></Link>
          </li>
          <li className="header-actions__menu-item">
            <a className="header-actions__link" target="_blank" rel="noopener noreferrer" href="http://meedan.com/check"><FormattedMessage id="headerActions.aboutCheck" defaultMessage="About Check" /></a>
          </li>
        </ul>
      </div>
    );
  }
}

export default HeaderActions;
