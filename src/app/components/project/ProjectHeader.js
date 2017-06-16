import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import Can from '../Can';
import ProjectRoute from '../../relay/ProjectRoute';
import MdArrowDropDown from 'react-icons/lib/md/arrow-drop-down';
import MdArrowBack from 'react-icons/lib/md/arrow-back';
import ProjectList from './ProjectList';
import CheckContext from '../../CheckContext';
import { bemClass } from '../../helpers.js';
import { Link } from 'react-router';

class ProjectHeaderComponent extends Component {
  getPusher() {
    const context = new CheckContext(this);
    return context.getContextStore().pusher;
  }

  subscribe() {
    const pusher = this.getPusher();
    if (pusher) {
      const that = this;
      pusher.subscribe(this.props.project.team.pusher_channel).bind('project_created', (data) => {
        that.props.relay.forceFetch();
      });
    }
  }

  componentDidMount() {
    this.subscribe();
  }

  unsubscribe() {
    const pusher = this.getPusher();
    if (pusher) {
      pusher.unsubscribe(this.props.project.team.pusher_channel);
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  dismiss() {
    document.getElementById('project-header-menu-toggle').checked = false
  }

  render() {
    const project = this.props.project;
    const projectUrl = window.location.pathname.match(/(.*\/project\/[0-9]+)/)[1];
    const isProjectSubpage = window.location.pathname.length > projectUrl.length;

    return (
      <div className="project-header">
        <Link to={projectUrl} className={bemClass('project-header__back-button', isProjectSubpage, '--displayed')}><MdArrowBack /></Link>
        <input type="checkbox" className="project-header__menu-toggle" id="project-header-menu-toggle" style={{ display: 'none' }} />
        <label className="project-header__menu-toggle-label" htmlFor="project-header-menu-toggle">
          <h2 className="project-header__title">{project.title}</h2>
          <span className="project-header__caret"><MdArrowDropDown /></span>
          <div className="project-header__menu-overlay" />
        </label>
        <div className="project-header__project-list" onClick={this.dismiss.bind(this)}><ProjectList team={project.team}/></div>
      </div>
    );
  }
}

ProjectHeaderComponent.contextTypes = {
  store: React.PropTypes.object,
};

const ProjectHeaderContainer = Relay.createContainer(ProjectHeaderComponent, {
  fragments: {
    project: () => Relay.QL`
      fragment on Project {
        id,
        dbid,
        title,
        description,
        permissions,
        get_slack_channel,
        team {
          id,
          dbid,
          slug,
          permissions,
          pusher_channel,
          get_slack_notifications_enabled,
          projects(first: 10000) {
            edges {
              node {
                title,
                dbid,
                id,
              }
            }
          }
        }
      }
    `,
  },
});


class ProjectHeader extends Component {
  render() {
    if (this.props.params && this.props.params.projectId) {
      const route = new ProjectRoute({ contextId: this.props.params.projectId });
      return (<Relay.RootContainer Component={ProjectHeaderContainer} route={route} />);
    }
    return null;
  }
}

export default ProjectHeader;
