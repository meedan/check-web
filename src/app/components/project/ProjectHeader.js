import React, { Component, PropTypes } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Relay from 'react-relay';
import Can from '../Can';
import ProjectRoute from '../../relay/ProjectRoute';
import MdArrowDropDown from 'react-icons/lib/md/arrow-drop-down';
import ProjectList from './ProjectList';

const messages = defineMessages({
  description: {
    id: 'projectHeader.description',
    defaultMessage: 'Verification Project'
  }
});

class ProjectHeaderComponent extends Component {
  render() {
    const project = this.props.project;
    const projectUrl = window.location.pathname.match(/(.*\/project\/[0-9]+)/)[1];

    return (
      <div className="project-header">
        <input type='checkbox' className='project-header__menu-toggle' id='project-header-menu-toggle' style={{display: 'none'}}/>
        <label className='project-header__menu-toggle-label' htmlFor='project-header-menu-toggle'>
          <h2 className="project-header__title">{project.title}</h2>
          <span className="project-header__caret"><MdArrowDropDown /></span>
          <div className='project-header__menu-overlay'></div>
        </label>
        <div className="project-header__project-list"><ProjectList team={project.team} /></div>
      </div>
    );
  }
}

ProjectHeaderComponent.PropTypes = {
  intl: intlShape.isRequired
};

ProjectHeaderComponent.contextTypes = {
  store: React.PropTypes.object,
};

const ProjectHeaderContainer = Relay.createContainer(injectIntl(ProjectHeaderComponent), {
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
    else {
      return null;
    }
  }
}

export default ProjectHeader;
