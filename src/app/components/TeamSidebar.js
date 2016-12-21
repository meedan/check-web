import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';
import FontAwesome from 'react-fontawesome';
import Pusher from 'pusher-js';
import CreateProject from './project/CreateProject';
import TeamRoute from '../relay/TeamRoute';
import teamFragment from '../relay/teamFragment';
import SwitchTeams from './team/SwitchTeams';
import CheckContext from '../CheckContext';
import Can from './Can';
import config from 'config';
import '../helpers';

class TeamSidebarComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isSwitchTeamsActive: false
    };
  }

  subscribe() {
    const pusher = this.getContext().pusher;
    if (pusher) {
      const that = this;
      pusher.subscribe(this.props.team.pusher_channel).bind('project_created', function(data) {
        that.props.relay.forceFetch();
      });
    }
  }

  componentDidMount() {
    this.subscribe();
  }

  unsubscribe() {
    const pusher = this.getContext().pusher;
    if (pusher) {
      pusher.unsubscribe(this.props.team.pusher_channel);
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  handleSwitchTeams() {
    this.setState({isSwitchTeamsActive: true});
  }

  handleSwitchTeamsClose() {
    this.setState({isSwitchTeamsActive: false});
  }

  getContext() {
    const context = new CheckContext(this);
    return context.getContextStore();
  }

  isCurrentProject(projectId) {
    var inProject = window.location.pathname.match(/\/project\/([0-9]+)/),
        currentProjectId = null,
        context = this.getContext();

    if (inProject) {
      currentProjectId = parseInt(inProject[1]);
    }
    else if (context.project) {
      currentProjectId = context.project.dbid;
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
                  {team.projects.edges.sortp((a,b) => a.node.title.localeCompare(b.node.title)).map(p => (
                    <li className={'team-sidebar__project' + (this.isCurrentProject(p.node.dbid) ? ' team-sidebar__project--current' : '')}>
                      <Link to={'/project/' + p.node.dbid} className='team-sidebar__project-link'>{p.node.title}</Link>
                    </li>
                  ))}

                  <Can permissions={team.permissions} permission="create Project">
                    <li className='team-sidebar__new-project'>
                      <CreateProject className='team-sidebar__new-project-input' team={team} />
                    </li>
                  </Can>
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

              {(() => {
                if (this.state.isSwitchTeamsActive) {
                  return (<SwitchTeams />);
                }
              })()}
            </section>
          </div>
        </footer>
      </nav>
    );
  }
}

TeamSidebarComponent.contextTypes = {
  store: React.PropTypes.object
};

const TeamSidebarContainer = Relay.createContainer(TeamSidebarComponent, {
  fragments: {
    team: () => Relay.QL`
      fragment on Team {
        id,
        dbid,
        name,
        avatar,
        description,
        subdomain,
        permissions,
        get_slack_notifications_enabled,
        get_slack_webhook,
        get_slack_channel,
        pusher_channel,
        media_verification_statuses,
        source_verification_statuses,
        contacts(first: 1) {
          edges {
            node {
              location,
              web,
              phone,
              id
            }
          }
        },
        projects(first: 10000) {
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
    `
  }
});

class TeamSidebar extends Component {
  render() {
    var route = new TeamRoute({ teamId: '' });
    return (<Relay.RootContainer Component={TeamSidebarContainer} route={route} />);
  }
}

export default TeamSidebar;
