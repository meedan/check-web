import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';
import FontAwesome from 'react-fontawesome';
import CreateProject from './project/CreateProject';
import TeamRoute from '../relay/TeamRoute';
import teamFragment from '../relay/teamFragment';
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
    var inProject = window.location.pathname.match(/\/project\/([0-9]+)/),
        currentProjectId = null;

    if (inProject) {
      currentProjectId = parseInt(inProject[1]);
    }
    else if (Checkdesk.context.project) {
      currentProjectId = Checkdesk.context.project.dbid;
    }

    return projectId === currentProjectId;
  }

  render() {
    var team = this.props.team;

    return (
      <nav className='team-sidebar'>
        <section className='team-sidebar__projects'>
          <h2 className='team-sidebar__projects-heading'>Verification Projects</h2>
          {(() => {
            if (team) {
              return (
                <ul className='team-sidebar__projects-list'>
                  {team.projects.edges.map(p => (
                    <li className={'team-sidebar__project' + (this.isCurrentProject(p.node.dbid) ? ' team-sidebar__project--current' : '')}>
                      <Link to={'/project/' + p.node.dbid} className='team-sidebar__project-link'>{p.node.title}</Link>
                    </li>
                  ))}
                  <li className='team-sidebar__new-project'>
                    <CreateProject className='team-sidebar__new-project-input' team={team} />
                  </li>
                </ul>
              );
            }
          })()}
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
              <SwitchTeams />
            </section>
          </div>
        </footer>
      </nav>
    );
  }
}

const TeamSidebarContainer = Relay.createContainer(TeamSidebarComponent, {
  fragments: {
    team: () => teamFragment
  }
});

class TeamSidebar extends Component {
  render() {
    var route = new TeamRoute({ teamId: '' });
    return (<Relay.RootContainer Component={TeamSidebarContainer} route={route} />);
  }
}

export default TeamSidebar;
