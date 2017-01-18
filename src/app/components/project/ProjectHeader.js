import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import Can from '../Can';
import ProjectRoute from '../../relay/ProjectRoute';
import { Link } from 'react-router';
import FontAwesome from 'react-fontawesome';

class ProjectHeaderComponent extends Component {
  render() {
    const project = this.props.project;

    return (
      <div className="project-header">
        <div className="project-header__copy">
          <h2 className="project-header__title">{project.title}</h2>
          <div className="project-header__description">
            <span className='project-header__description-summary'>{project.description || 'Verification Project'}</span>
            { project.description ? <span className='project-header__description-fulltext'>{project.description}</span> : null }
          </div>
        </div>
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
          subdomain,
          permissions,
          get_slack_notifications_enabled
        }
      }
    `,
  },
});


class ProjectHeader extends Component {
  render() {
    const route = new ProjectRoute({ contextId: this.props.params.projectId });
    return (<Relay.RootContainer Component={ProjectHeaderContainer} route={route} />);
  }
}

export default ProjectHeader;
