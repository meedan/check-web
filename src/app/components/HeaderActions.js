import React, { Component, PropTypes } from 'react';
import UserMenuRelay from '../relay/UserMenuRelay';
import { logout } from '../actions/actions';
import { FormattedMessage } from 'react-intl';
import { MdSearch, MdMoreVert } from 'react-icons/lib/md';
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

  render() {
    return (
      <div className={bemClass('header-actions', this.state.isMenuOpen, '--active')}>
        {(() => {
          if (this.props.params && this.props.params.team) {
            return (<Link to={`/${this.props.params.team}/search`}><MdSearch name="search" className="header-actions__search-icon" /></Link>);
          }
        })()}
        <MdMoreVert className="header-actions__menu-toggle" onClick={this.toggleSettingsMenu.bind(this)} />
        <div className={bemClass('header-actions__menu-overlay', this.state.isMenuOpen, '--active')} onClick={this.toggleSettingsMenu.bind(this)} />
        <ul className={bemClass('header-actions__menu', this.state.isMenuOpen, '--active')}>
          <li className="header-actions__menu-item" style={{ cursor: 'default' }}><UserMenuRelay {...this.props} /></li>
          <li className="header-actions__menu-item"><Link to='/check/teams'><FormattedMessage id="headerActions.userTeams" defaultMessage="Your Teams" /></Link></li>
          <ProjectMenuRelay {...this.props} />
          <TeamMenuRelay {...this.props} />
          <li className="header-actions__menu-item header-actions__menu-item--logout" onClick={logout}>
            <FormattedMessage id="headerActions.signOut" defaultMessage="Sign Out" />
          </li>
          <li className="header-actions__menu-item">
            <a className="header-actions__link" target="_blank" rel="noopener noreferrer" href="https://docs.google.com/forms/d/e/1FAIpQLSdctP7RhxeHjTnevnvRi6AKs4fX3wNnxecVdBFwKe7GRVcchg/viewform"><FormattedMessage id="headerActions.contactHuman" defaultMessage="Contact a Human" /></a>
          </li>
          <li className="header-actions__menu-item">
            <Link className="header-actions__link" to="/check/tos"><FormattedMessage id="headerActions.tos" defaultMessage="Terms of Service" /></Link>
          </li>
          <li className="header-actions__menu-item">
            <Link className="header-actions__link" to="/check/privacy"><FormattedMessage id="headerActions.privacyPolicy" defaultMessage="Privacy Policy" /></Link>
          </li>
          <li className="header-actions__menu-item">
            <a className="header-actions__link" target="_blank" rel="noopener noreferrer" href="https://meedan.com/check"><FormattedMessage id="headerActions.aboutCheck" defaultMessage="About Check" /></a>
          </li>
        </ul>
      </div>
    );
  }
}

export default HeaderActions;
