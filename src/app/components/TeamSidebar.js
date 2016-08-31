import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';
import FontAwesome from 'react-fontawesome';
import CreateProject from './project/CreateProject';
import MeRoute from '../relay/MeRoute';

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
                    <li className='team-sidebar__project'>
                      <FontAwesome className='team-sidebar__project-icon' name='folder-open' />
                      <Link to={'/project/' + p.node.dbid} className='team-sidebar__project-link'>{p.node.title}</Link>
                    </li>
                  ))}
                  <li className='team-sidebar__new-project'>
                    <FontAwesome className='team-sidebar__project-icon' name='folder' />
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
          <button onClick={this.handleSwitchTeams.bind(this)} className='team-sidebar__switch-teams'>
            <FontAwesome className='team-sidebar__switch-teams-icon' name='random' />
            <span>Switch Teams</span>
          </button>

          {/* possibly should decompose into separate component */}
          <div className={'switch-teams' + (this.state.isSwitchTeamsActive ? ' switch-teams--active' : '')} onClick={this.handleSwitchTeamsClose.bind(this)}>
            <section className='switch-teams__modal'>
              <button className='switch-teams__modal-close' onClick={this.handleSwitchTeamsClose.bind(this)}>×</button>

              <h2 className='switch-teams__modal-title'>
                <FontAwesome className='switch-teams__modal-title-icon' name='random' />
                <span>Switch Teams</span>
              </h2>

              <ul className='switch-teams__teams'>

                {/* 1. current team */}
                {(() => {
                  if (currentTeam) {
                    return (
                      <li className='switch-teams__team switch-teams__team--current'>
                        <Link to={'/team/' + currentTeam.dbid} className='switch-teams__team-link'>
                          <div className='switch-teams__team-avatar' style={{'background-image': 'url(' + currentTeam.avatar + ')'}}></div>
                          <div className='switch-teams__team-copy'>
                            <h3 className='switch-teams__team-name'>{currentTeam.name}</h3>
                            <span className='switch-teams__team-members-count'>{membersCountString(currentTeam.members_count)}</span>
                          </div>
                          <div className='switch-teams__team-actions'>
                            <FontAwesome className='switch-teams__team-caret' name='angle-right' />
                          </div>
                        </Link>
                      </li>
                    );
                  }
                })()}

                {/* 2. iterate through other teams the user belongs to */}
                {otherTeams.map(function(team) {
                  return (
                    <li className='switch-teams__team'>
                      <Link to={team.url} className='switch-teams__team-link'>
                        <div className='switch-teams__team-avatar' style={{'background-image': 'url(' + team.avatar + ')'}}></div>
                        <div className='switch-teams__team-copy'>
                          <h3 className='switch-teams__team-name'>{team.name}</h3>
                          <span className='switch-teams__team-members-count'>{membersCountString(team.membersCount)}</span>
                        </div>
                        <div className='switch-teams__team-actions'>
                          <FontAwesome className='switch-teams__team-caret' name='angle-right' />
                        </div>
                      </Link>
                    </li>
                  );
                })}

                {/* 3. iterate through any teams the user has requested to join but not been approved yet */}
                {pendingTeams.map(function(team) {
                  return (
                    <li className='switch-teams__team switch-teams__team--pending'>
                      <div className='switch-teams__team-avatar' style={{'background-image': 'url(' + team.avatar + ')'}}></div>
                      <div className='switch-teams__team-copy'>
                        <h3 className='switch-teams__team-name'><Link to={team.url}>{team.name}</Link></h3>
                        <span className='switch-teams__team-join-request-message'>You requested to join</span>
                      </div>
                      <div className='switch-teams__team-actions'>
                        <button className='switch-teams__cancel-join-request'>Cancel</button>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* 4. new team */}
              <Link to='/teams/new' className='switch-teams__new-team-link'>+ New team</Link>
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
