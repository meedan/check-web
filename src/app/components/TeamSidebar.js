import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay';
import { Link } from 'react-router';
import FontAwesome from 'react-fontawesome';
import Pusher from 'pusher-js';
import CreateProject from './project/CreateProject';
import TeamRoute from '../relay/TeamRoute';
import CheckContext from '../CheckContext';
import Can from './Can';
import config from 'config';
import '../helpers';

class TeamSidebarComponent extends Component {
  subscribe() {
    const pusher = this.getContext().pusher;
    if (pusher) {
      const that = this;
      pusher.subscribe(this.props.team.pusher_channel).bind('project_created', (data) => {
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

  getContext() {
    const context = new CheckContext(this);
    return context.getContextStore();
  }

  isCurrentProject(projectId) {
    let inProject = window.location.pathname.match(/\/project\/([0-9]+)/),
      currentProjectId = null,
      context = this.getContext();

    if (inProject) {
      currentProjectId = parseInt(inProject[1]);
    } else if (context.project) {
      currentProjectId = context.project.dbid;
    }

    return projectId === currentProjectId;
  }

  render() {
    const team = this.props.team;

    return (
      <nav className="team-sidebar">
        <section className="team-sidebar__projects">
          <h2 className="team-sidebar__projects-heading"><FormattedMessage id="teamSidebar.projectsHeading" defaultMessage="Verification Projects" /></h2>
          {(() => {
            if (team) {
              return (
                <ul className="team-sidebar__projects-list">
                  {team.projects.edges.sortp((a, b) => a.node.title.localeCompare(b.node.title)).map(p => (
                    <li className={`team-sidebar__project${this.isCurrentProject(p.node.dbid) ? ' team-sidebar__project--current' : ''}`}>
                      <Link to={`/${team.slug}/project/${p.node.dbid}`} className="team-sidebar__project-link">{p.node.title}</Link>
                    </li>
                  ))}

                  <Can permissions={team.permissions} permission="create Project">
                    <li className="team-sidebar__new-project">
                      <CreateProject className="team-sidebar__new-project-input" team={team} />
                    </li>
                  </Can>
                </ul>
              );
            }
          })()}
        </section>
      </nav>
    );
  }
}

TeamSidebarComponent.contextTypes = {
  store: React.PropTypes.object,
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
        slug,
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
    `,
  },
});

class TeamSidebar extends Component {
  render() {
    const route = new TeamRoute({ teamSlug: '' });
    return (<Relay.RootContainer Component={TeamSidebarContainer} route={route} />);
  }
}

export default TeamSidebar;
