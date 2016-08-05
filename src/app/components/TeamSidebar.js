import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import FontAwesome from 'react-fontawesome';

class TeamSidebar extends Component {
  render() {
    return (
      <nav className='team-sidebar'>
        <section className='team-sidebar__team'>
          <div className='team-sidebar__team-avatar'></div>
          <h1 className='team-sidebar__team-name'>
            <Link to="/" id="link-home" className='team-sidebar__team-link' activeClassName="team-sidebar__team-link--active" title="Home">My Team</Link>
          </h1>
        </section>

        <section className='team-sidebar__projects'>
          <h2 className='team-sidebar__projects-heading'>Projects</h2>
          <ul className='team-sidebar__projects-list'>
            <li className='team-sidebar__new-project'>+ New project...</li>
          </ul>
        </section>

        <section className='team-sidebar__sources'>
          <h2 className='team-sidebar__sources-heading'>
            <Link to="/sources" id="link-sources" className='team-sidebar__sources-link' activeClassName='team-sidebar__sources-link--active' title="Sources">Sources</Link>
          </h2>
          <ul className='team-sidebar__sources-list'>
            <li className='team-sidebar__new-source'>
              <Link to="/sources/new" id="link-sources-new" className='team-sidebar__new-source-link' activeClassName='team-sidebar__new-source-link--active' title="Create a source">+ New source...</Link>
            </li>
          </ul>
        </section>
      </nav>
    );
  }
}

export default TeamSidebar;
