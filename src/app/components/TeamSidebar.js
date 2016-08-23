import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import FontAwesome from 'react-fontawesome';

class TeamSidebar extends Component {
  render() {
    var currentTeam = this.props.team;
    var sources = [
      {name: 'Source 1', icon: 'https://pbs.twimg.com/profile_images/579014890788024320/Gr0R3XJy.jpeg'},
      {name: 'Source 2', icon: 'https://pbs.twimg.com/profile_images/1980294624/DJT_Headshot_V2.jpg'}
    ]

    return (
      <nav className='team-sidebar'>
        <section className='team-sidebar__team'>
          <div className='team-sidebar__team-avatar'>
            <img src={currentTeam.avatar} />
          </div>
          <h1 className='team-sidebar__team-name'>
            <Link to="/" id="link-home" className='team-sidebar__team-link' activeClassName="team-sidebar__team-link--active" title="Home">{currentTeam.name}</Link>
          </h1>
        </section>

        <section className='team-sidebar__projects'>
          {/* <h2 className='team-sidebar__projects-heading'>Projects</h2> */}
          <ul className='team-sidebar__projects-list'>
            {currentTeam.projects.map(function(p) {
              return (
                <li className='team-sidebar__project'>
                  <FontAwesome className='team-sidebar__project-icon' name='folder-open' />
                  <a href={p.url} className='team-sidebar__project-link'>{p.name}</a>
                </li>
              );
            })}
            <li className='team-sidebar__new-project'>
              <FontAwesome className='team-sidebar__project-icon' name='folder' />
              <input className='team-sidebar__new-project-input' placeholder='New project...' />
            </li>
          </ul>
        </section>

        <section className='team-sidebar__sources'>
          <h2 className='team-sidebar__sources-heading'>
            <Link to="/sources" id="link-sources" className='team-sidebar__sources-link' activeClassName='team-sidebar__sources-link--active' title="Sources">Sources</Link>
          </h2>
          <ul className='team-sidebar__sources-list'>
            {/* Possibly list sources in sidebar but let's not worry about it right now
            <li className='team-sidebar__source'>
              <img src={sources[0].icon} className='team-sidebar__source-icon' />
              <Link to="/sources/1" className='team-sidebar__source-link' activeClassName='team-sidebar__source-link--active'>{sources[0].name}</Link>
            </li>
            <li className='team-sidebar__source'>
              <img src={sources[1].icon} className='team-sidebar__source-icon' />
              <Link to="/sources/2" className='team-sidebar__source-link' activeClassName='team-sidebar__source-link--active'>{sources[0].name}</Link>
            </li>
            */}
            <li className='team-sidebar__new-source'>
              <FontAwesome className='team-sidebar__new-source-icon' name='user' />
              <Link to="/sources/new" id="link-sources-new" className='team-sidebar__new-source-link' activeClassName='team-sidebar__new-source-link--active' title="Create a source">New source...</Link>
            </li>
          </ul>
        </section>
      </nav>
    );
  }
}

export default TeamSidebar;
