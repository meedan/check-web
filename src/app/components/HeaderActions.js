import React, { Component, PropTypes } from 'react';
import UserMenuRelay from '../relay/UserMenuRelay';
import { logout } from '../actions/actions';
import { MdSearch, MdMoreHoriz } from 'react-icons/lib/md';
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
            return (<Link to={`/${this.props.params.team}/search`}><MdSearch name="search" className="header-actions__search-icon" /></Link>);
          }
        })()}
        <MdMoreHoriz className="header-actions__menu-toggle" onClick={this.toggleSettingsMenu.bind(this)} />
        <div className={bemClass('header-actions__menu-overlay', this.state.isMenuOpen, '--active')} onClick={this.toggleSettingsMenu.bind(this)} />
        <ul className={bemClass('header-actions__menu', this.state.isMenuOpen, '--active')}>
          <li className="header-actions__menu-item" style={{ cursor: 'default' }}><UserMenuRelay {...this.props} /></li>
          <ProjectMenuRelay {...this.props} />
          <TeamMenuRelay {...this.props} />
          <li className="header-actions__menu-item" onClick={this.contactHuman.bind(this)}>Contact a Human</li>
          <li className="header-actions__menu-item header-actions__menu-item--logout" onClick={logout}>Sign Out</li>
          <li className="header-actions__menu-item"><Link className="header-actions__link" to="/check/tos">Terms of Service</Link></li>
          <li className="header-actions__menu-item"><Link className="header-actions__link" to="/check/privacy">Privacy Policy</Link></li>
          <li className="header-actions__menu-item"><a className="header-actions__link" target="_blank" rel="noopener noreferrer" href="http://meedan.com/check">About Check</a></li>
        </ul>
      </div>
    );
  }
}

export default HeaderActions;
