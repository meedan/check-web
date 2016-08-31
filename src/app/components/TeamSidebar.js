import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';
import FontAwesome from 'react-fontawesome';
import CreateProject from './project/CreateProject';
import MeRoute from '../relay/MeRoute';
import SwitchTeams from './team/SwitchTeams';

class TeamSidebarComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isSwitchTeamsActive: false
    };
  }

  handleSwitchTeams() {
    this.setState({isSwitchTeamsActive: true});
  }

  handleSwitchTeamsClose() {
    this.setState({isSwitchTeamsActive: false});
  }

  isCurrentProject(projectId) {
    // hack while Caio reworks Checkdesk.currentProject; remove when resolved
    const currentPath = window.location.pathname;
    const projectIdFromCurrentPath = parseInt(/^\/project\/(\d+)$/.exec(currentPath)[1]);
    return projectId === projectIdFromCurrentPath;
    // /hack

    return projectId &&
      Checkdesk.currentProject &&
      Checkdesk.currentProject.dbid &&
      Checkdesk.currentProject.dbid === projectId;
  }

  render() {
    var currentTeam = this.props.me.current_team;

    // dummy data
    var otherTeams = [
      {
        name: 'ProPublica',
        avatar: 'https://pbs.twimg.com/profile_images/660147326091182081/Q4TLW_Fe.jpg',
        url: '/teams/2',
        membersCount: 10
      }
    ];
    var pendingTeams = [
      {
        name: 'AntiPublica',
        avatar: 'https://pbs.twimg.com/profile_images/660147326091182081/Q4TLW_Fe.jpg',
        url: '/teams/3',
      }
    ];
    // /dummy data

    function membersCountString(count) {
      if (typeof count === 'number') {
        return count.toString() + ' member' + (count === 1 ? '' : 's');
      }
    }

    return (
      <nav className='team-sidebar'>
        {(() => {
          if (currentTeam) {
            return (
              <section className='team-sidebar__team'>
                <div className='team-sidebar__team-avatar'>
                  <img src={currentTeam.avatar} />
                </div>
                <h1 className='team-sidebar__team-name'>
                  <Link to="/" id="link-home" className='team-sidebar__team-link' activeClassName="team-sidebar__team-link--active" title="Home">{currentTeam.name}</Link>
                </h1>
              </section>
            );
          }
        })()}

        <section className='team-sidebar__projects'>
          <h2 className='team-sidebar__projects-heading'>Verification Projects</h2>
          {(() => {
            if (currentTeam) {
              return (
                <ul className='team-sidebar__projects-list'>
                  {currentTeam.projects.edges.map(p => (
                    <li className={'team-sidebar__project' + (this.isCurrentProject(p.node.dbid) ? ' team-sidebar__project--current' : '')}>
                      <Link to={'/project/' + p.node.dbid} className='team-sidebar__project-link'>{p.node.title}</Link>
                    </li>
                  ))}
                  <li className='team-sidebar__new-project'>
                    <CreateProject className='team-sidebar__new-project-input' teamId={currentTeam.id} />
                  </li>
                </ul>
              );
            }
          })()}
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

        <footer className='team-sidebar__footer'>
          <button onClick={this.handleSwitchTeams.bind(this)} className='team-sidebar__switch-teams-button'>
            <FontAwesome className='team-sidebar__switch-teams-icon' name='random' />
            <span>Switch Teams</span>
          </button>

          <div className={'team-sidebar__switch-teams-overlay' + (this.state.isSwitchTeamsActive ? ' team-sidebar__switch-teams-overlay--active' : '')} onClick={this.handleSwitchTeamsClose.bind(this)}>
            <section className='team-sidebar__switch-teams-modal'>
              <button className='team-sidebar__switch-teams-close' onClick={this.handleSwitchTeamsClose.bind(this)}>×</button>
              <h2 className='team-sidebar__switch-teams-title'>
                <FontAwesome className='team-sidebar__switch-teams-title-icon' name='random' />
                <span>Switch Teams</span>
              </h2>
              <SwitchTeams currentTeam={currentTeam} otherTeams={otherTeams} pendingTeams={pendingTeams} />
            </section>
          </div>
        </footer>
      </nav>
    );
  }
}

const TeamSidebarContainer = Relay.createContainer(TeamSidebarComponent, {
  fragments: {
    me: () => Relay.QL`
      fragment on User {
        current_team {
          id,
          name,
          avatar,
          members_count,
          projects(first: 20) {
            edges {
              node {
                title,
                dbid,
                id,
                description
              }
            }
          }
        }
      }
    `
  }
});

class TeamSidebar extends Component {
  render() {
    var route = new MeRoute();
    return (<Relay.RootContainer Component={TeamSidebarContainer} route={route} />);
  }
}

export default TeamSidebar;
